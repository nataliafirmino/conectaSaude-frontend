
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConsultaService, ConsultaResponse } from '../services/consulta.service';
import { AuthService, SessaoUsuario } from '../services/auth.service';

export interface AgendamentoItem {
  id: number;
  tipoAtendimento: 'Consulta médica' | 'Exame';
  icone: string;
  hospital: string;
  profissional: string;
  especialidade: string;
  data: string;
  dataCurta: string;
  horario: string;
  status: 'Confirmado' | 'Agendado' | 'Realizado' | 'Cancelado';
  categoria: 'proximos' | 'historico';
  mesAno?: string;
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: false
})
export class ConsultasPage {

  readonly abaAtiva = signal<'proximos' | 'historico'>('proximos');

  readonly modalDetalhesAberto = signal(false);
  readonly modalCancelarAberto = signal(false);
  readonly mostrarBannerCancelado = signal(false);

  readonly itemSelecionado = signal<AgendamentoItem | null>(null);

  readonly agendamentos = signal<AgendamentoItem[]>([]);

  readonly carregando = signal(false);
  readonly cancelando = signal(false);
  readonly mensagemErro = signal('');

  readonly proximosAgendamentos = computed(() =>
    this.agendamentos().filter(
      item => item.categoria === 'proximos'
    )
  );

  readonly historicoAgendamentos = computed(() =>
    this.agendamentos().filter(
      item => item.categoria === 'historico'
    )
  );

  readonly historicoAgrupado = computed(() => {
    const grupos: { [key: string]: AgendamentoItem[] } = {};

    this.historicoAgendamentos().forEach(item => {
      const chave = item.mesAno || 'Anteriores';

      if (!grupos[chave]) {
        grupos[chave] = [];
      }

      grupos[chave].push(item);
    });

    return Object.keys(grupos).map(mes => ({
      mes,
      itens: grupos[mes]
    }));
  });

  constructor(
    private router: Router,
    private consultaService: ConsultaService,
    private authService: AuthService
  ) { }

  ionViewWillEnter(): void {
    this.carregarSessao();
  }

  carregarSessao(): void {
    const sessao = this.authService.getUsuarioLogado();

    if (sessao) {
      this.carregarAgendamentos(sessao);
      return;
    }

    this.authService.obterSessao().subscribe({
      next: (sessao) => {
        this.carregarAgendamentos(sessao);
      },
      error: (erro) => {
        console.error('Erro ao recuperar sessão:', erro);
        this.mensagemErro.set(
          'Não foi possível identificar o usuário logado.'
        );
      }
    });
  }

  carregarAgendamentos(sessao: SessaoUsuario): void {
    if (!sessao.idPaciente) {
      this.mensagemErro.set(
        'Não foi possível identificar o paciente.'
      );
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.consultaService.listarPorPaciente(sessao.idPaciente).subscribe({
      next: (resposta) => {
        this.agendamentos.set(
          (resposta ?? []).map(consulta =>
            this.converterAgendamento(consulta)
          )
        );

        this.carregando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar agendamentos:', erro);

        this.mensagemErro.set(
          'Não foi possível carregar seus agendamentos.'
        );

        this.carregando.set(false);
      }
    });
  }

  converterAgendamento(consulta: ConsultaResponse): AgendamentoItem {
    const data = this.formatarData(consulta.dataAgendamento);
    const dataCurta = this.formatarDataCurta(consulta.dataAgendamento);
    const mesAno = this.formatarMesAno(consulta.dataAgendamento);

    const tipoNormalizado = consulta.tipo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const ehExame = tipoNormalizado.includes('exame');

    const statusMapeado = {
      AGENDADA: 'Agendado',
      CANCELADA: 'Cancelado',
      REALIZADA: 'Realizado'
    } as const;

    const hoje = this.dataAtualISO();

    const categoria: 'proximos' | 'historico' =
      consulta.status === 'AGENDADA' &&
        consulta.dataAgendamento >= hoje
        ? 'proximos'
        : 'historico';

    return {
      id: consulta.id,
      tipoAtendimento: ehExame ? 'Exame' : 'Consulta médica',
      icone: ehExame ? 'clipboard-outline' : 'medkit-outline',
      hospital: consulta.nomeHospital,
      profissional: consulta.nomeMedico,
      especialidade: consulta.especialidadeMedico,
      data,
      dataCurta,
      horario: consulta.horaAgendamento.substring(0, 5),
      status: statusMapeado[consulta.status],
      categoria,
      mesAno: categoria === 'historico' ? mesAno : undefined
    };
  }

  dataAtualISO(): string {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  formatarData(dataISO: string): string {
    const [ano, mes, dia] = dataISO.split('-').map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatarDataCurta(dataISO: string): string {
    const [ano, mes, dia] = dataISO.split('-').map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long'
    });
  }

  formatarMesAno(dataISO: string): string {
    const [ano, mes, dia] = dataISO.split('-').map(Number);

    const resultado = new Date(ano, mes - 1, dia)
      .toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });

    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
  }

  selecionarAba(aba: 'proximos' | 'historico'): void {
    this.abaAtiva.set(aba);
  }

  abrirDetalhes(item: AgendamentoItem): void {
    this.itemSelecionado.set(item);
    this.modalDetalhesAberto.set(true);
  }

  fecharDetalhes(): void {
    this.modalDetalhesAberto.set(false);
  }

  abrirCancelar(item: AgendamentoItem): void {
    this.itemSelecionado.set(item);
    this.modalCancelarAberto.set(true);
  }

  fecharCancelar(): void {
    if (!this.cancelando()) {
      this.modalCancelarAberto.set(false);
    }
  }

  confirmarCancelamento(): void {
    const item = this.itemSelecionado();

    if (!item || this.cancelando()) {
      return;
    }

    const idConsulta = item.id;

    this.cancelando.set(true);
    this.mensagemErro.set('');

    this.consultaService.cancelarConsulta(idConsulta).subscribe({
      next: (resposta) => {
        const consultaAtualizada = this.converterAgendamento(resposta);

        this.agendamentos.update(lista =>
          lista.map(item =>
            item.id === idConsulta ? consultaAtualizada : item
          )
        );

        this.itemSelecionado.set(consultaAtualizada);

        this.modalCancelarAberto.set(false);
        this.mostrarBannerCancelado.set(true);
        this.cancelando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao cancelar consulta:', erro);

        this.mensagemErro.set(
          'Não foi possível cancelar a consulta. Tente novamente.'
        );

        this.cancelando.set(false);
      }
    });
  }

  isBannerCancelado(): void {
    this.mostrarBannerCancelado.set(false);
  }

  irParaHistorico(): void {
    this.mostrarBannerCancelado.set(false);
    this.abaAtiva.set('historico');
  }
}
