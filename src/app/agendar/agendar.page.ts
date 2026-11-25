import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import {ConsultaResponse, ConsultaService, HospitalItem, MedicoItem} from '../services/consulta.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-agendar',
  templateUrl: './agendar.page.html',
  styleUrls: ['./agendar.page.scss'],
  standalone: false,
})
export class AgendarPage implements OnInit {
  readonly etapaAtual = signal<number>(1);
  readonly carregando = signal<boolean>(false);
  readonly confirmando = signal<boolean>(false);
  readonly buscaHospital = signal<string>('');

  readonly hospitais = signal<HospitalItem[]>([]);
  readonly medicos = signal<MedicoItem[]>([]);
  readonly consultaCriada = signal<ConsultaResponse | null>(null);
  readonly nomeUsuario = signal<string>('Paciente');

  readonly hospitaisFiltrados = computed(() => {
    const termo = this.buscaHospital().trim().toLowerCase();
    const lista = this.hospitais();
    if (!termo) {
      return lista;
    }
    return lista.filter(
      (h) =>
        h.nome.toLowerCase().includes(termo) ||
        h.endereco.toLowerCase().includes(termo)
    );
  });

  // Objeto para armazenar as escolhas do usuário
  agendamento = {
    tipo: 'Consulta médica',
    especialidade: '',
    especialidadeDesc: '',
    idHospital: null as number | null,
    hospital: '',
    hospitalLocal: '',
    idMedico: null as number | null,
    profissional: '',
    profissionalDetalhe: '',
    dataIso: '2026-12-01',
    data: '1 de dezembro de 2026',
    horario: '',
  };

  // Variáveis para controle dinâmico do calendário
  mesAtualIndex: number = 0;
  mesesDisponiveis = [
    {
      nome: 'Dezembro de 2026',
      anoMes: '2026-12',
      dias: ['01', '02', '03', '04', '07'],
    },
    {
      nome: 'Janeiro de 2027',
      anoMes: '2027-01',
      dias: ['05', '06', '07', '08', '11'],
    },
    {
      nome: 'Fevereiro de 2027',
      anoMes: '2027-02',
      dias: ['02', '03', '04', '05', '08'],
    },
  ];

  diaSelecionado: string = '01';

  constructor(
    private router: Router,
    private consultaService: ConsultaService,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioLogado();
    if (usuario?.nome) {
      this.nomeUsuario.set(usuario.nome);
    } else {
      this.authService.obterSessao().subscribe({
        next: (sessao) => {
          if (sessao?.nome) {
            this.nomeUsuario.set(sessao.nome);
          }
        },
        error: () => {},
      });
    }

    this.carregarHospitais();
  }

  private async exibirToast(mensagem: string, cor: 'success' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'bottom',
    });
    await toast.present();
  }

  carregarHospitais() {
    this.carregando.set(true);
    this.consultaService.listarHospitaisAtivos().subscribe({
      next: (lista) => {
        this.hospitais.set(lista ?? []);
        this.carregando.set(false);
      },
      error: async (err) => {
        this.carregando.set(false);
        const msg = err?.error?.message || 'Não foi possível carregar os hospitais.';
        await this.exibirToast(msg, 'danger');
      },
    });
  }

  carregarMedicosDoHospital(idHospital: number) {
    this.carregando.set(true);
    this.medicos.set([]);
    this.agendamento.idMedico = null;
    this.agendamento.profissional = '';
    this.agendamento.profissionalDetalhe = '';

    this.consultaService.listarMedicosPorHospital(idHospital).subscribe({
      next: (lista) => {
        this.medicos.set(lista ?? []);
        this.carregando.set(false);
      },
      error: async (err) => {
        this.carregando.set(false);
        const msg = err?.error?.message || 'Não foi possível carregar os médicos da unidade.';
        await this.exibirToast(msg, 'danger');
      },
    });
  }

  // Selecionar Especialidade (Etapa 1)
  selecionarEspecialidade(nome: string, desc: string) {
    this.agendamento.especialidade = nome;
    this.agendamento.especialidadeDesc = desc;
    this.agendamento.tipo = nome === 'Exames de imagem' ? 'Exame' : 'Consulta médica';
  }

  // Selecionar Hospital / Unidade (Etapa 2)
  selecionarHospital(hospital: HospitalItem) {
    this.agendamento.idHospital = hospital.id;
    this.agendamento.hospital = hospital.nome;
    this.agendamento.hospitalLocal = hospital.endereco;
  }

  // Selecionar Profissional (Etapa 3)
  selecionarProfissional(medico: MedicoItem) {
    this.agendamento.idMedico = medico.id;
    this.agendamento.profissional = medico.nome;
    this.agendamento.profissionalDetalhe = `${medico.especialidade} • ${this.agendamento.hospital}`;
  }

  // Mudar mês no calendário (Etapa 4)
  mudarMes(direcao: number) {
    this.mesAtualIndex += direcao;
    if (this.mesAtualIndex < 0) this.mesAtualIndex = 0;
    if (this.mesAtualIndex >= this.mesesDisponiveis.length) {
      this.mesAtualIndex = this.mesesDisponiveis.length - 1;
    }
    const mes = this.mesesDisponiveis[this.mesAtualIndex];
    if (mes.dias.length > 0) {
      this.selecionarDia(mes.dias[0]);
    }
  }

  // Selecionar o dia específico (Etapa 4)
  selecionarDia(dia: string) {
    this.diaSelecionado = dia;
    const mes = this.mesesDisponiveis[this.mesAtualIndex];
    this.agendamento.dataIso = `${mes.anoMes}-${dia}`;
    this.agendamento.data = `${Number(dia)} de ${mes.nome.toLowerCase()}`;
  }

  // Selecionar Horário (Etapa 4)
  selecionarHorario(hora: string) {
    this.agendamento.horario = hora;
  }

  async proximaEtapa() {
    const etapa = this.etapaAtual();

    if (etapa === 1 && !this.agendamento.especialidade) {
      await this.exibirToast('Por favor, selecione uma especialidade.', 'danger');
      return;
    }
    if (etapa === 2) {
      if (!this.agendamento.idHospital) {
        await this.exibirToast('Por favor, selecione uma unidade.', 'danger');
        return;
      }
      this.etapaAtual.set(3);
      this.carregarMedicosDoHospital(this.agendamento.idHospital);
      return;
    }
    if (etapa === 3 && !this.agendamento.idMedico) {
      await this.exibirToast('Por favor, selecione um profissional.', 'danger');
      return;
    }
    if (etapa === 4 && (!this.agendamento.horario || !this.diaSelecionado)) {
      await this.exibirToast('Por favor, selecione o dia e o horário.', 'danger');
      return;
    }

    if (etapa < 6) {
      this.etapaAtual.set(etapa + 1);
    }
  }

  async confirmarAgendamento() {
    if (this.confirmando()) {
      return;
    }

    const usuario = this.authService.getUsuarioLogado();
    const idPaciente = usuario?.id;

    if (!idPaciente) {
      await this.exibirToast('Sessão não identificada. Faça login novamente.', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.agendamento.idHospital || !this.agendamento.idMedico || !this.agendamento.horario) {
      await this.exibirToast('Dados do agendamento incompletos.', 'danger');
      return;
    }

    const payload = {
      tipo: this.agendamento.tipo,
      dataAgendamento: this.agendamento.dataIso,
      horaAgendamento: `${this.agendamento.horario}:00`,
      idPaciente,
      idHospital: this.agendamento.idHospital,
      idMedico: this.agendamento.idMedico,
    };

    this.confirmando.set(true);
    this.consultaService.agendarConsulta(payload).subscribe({
      next: async (resposta) => {
        this.confirmando.set(false);
        this.consultaCriada.set(resposta);
        this.etapaAtual.set(6);
        await this.exibirToast('Agendamento confirmado com sucesso!', 'success');
      },
      error: async (err) => {
        this.confirmando.set(false);
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Não foi possível concluir o agendamento.';
        await this.exibirToast(msg, 'danger');
      },
    });
  }

  etapaAnterior() {
    const etapa = this.etapaAtual();
    if (etapa > 1 && etapa < 6) {
      this.etapaAtual.set(etapa - 1);
    } else {
      this.router.navigate(['/home']);
    }
  }

  voltarInicio() {
    this.router.navigate(['/home']);
  }

  irParaConsultas() {
    this.router.navigate(['/consultas']);
  }
}