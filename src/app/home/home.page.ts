import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, SessaoUsuario } from '../services/auth.service';
import {
  ConsultaService,
  ConsultaResponse
} from '../services/consulta.service';

interface ProximoAgendamento {
  tipo: string;
  status: string;
  hospital: string;
  medico: string;
  especialidade: string;
  data: string;
  horario: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {

  usuarioNome = this.authService.usuarioNome;

  proximoAgendamento = signal<ProximoAgendamento | null>(null);

  carregandoProximo = signal(false);

  mensagemErro = signal('');

  constructor(
    private router: Router,
    private authService: AuthService,
    private consultaService: ConsultaService
  ) {}

  ionViewWillEnter(): void {
    this.carregarSessao();
  }

  carregarSessao(): void {
    const sessao = this.authService.getUsuarioLogado();

    if (sessao) {
      this.processarSessao(sessao);
      return;
    }

    this.authService.obterSessao().subscribe({
      next: (sessao) => {
        this.processarSessao(sessao);
      },
      error: (erro) => {
        console.error('Erro ao recuperar sessão:', erro);
        this.mensagemErro.set('Não foi possível recuperar seus dados.');
      }
    });
  }

  processarSessao(sessao: SessaoUsuario): void {

    if (!sessao.autenticado || !sessao.idPaciente) {
      this.proximoAgendamento.set(null);
      return;
    }

    this.carregarProximoAgendamento(sessao.idPaciente);
  }

  carregarProximoAgendamento(idPaciente: number): void {

    this.carregandoProximo.set(true);
    this.mensagemErro.set('');

    this.consultaService.listarPorPaciente(idPaciente).subscribe({

      next: (consultas) => {

        const agora = new Date();

        const proximasConsultas = consultas
          .filter(consulta => {

            const status = String(consulta.status).trim().toUpperCase();

            const dataConsulta = this.converterDataHora(consulta);

            return status === 'AGENDADA' &&
              !isNaN(dataConsulta.getTime()) &&
              dataConsulta.getTime() >= agora.getTime();

          })
          .sort((a, b) => {

            return this.converterDataHora(a).getTime() -
              this.converterDataHora(b).getTime();

          });

        const proxima = proximasConsultas.length > 0
          ? this.converterAgendamento(proximasConsultas[0])
          : null;

        this.proximoAgendamento.set(proxima);

        this.carregandoProximo.set(false);

      },

      error: (erro) => {

        console.error('Erro ao carregar próximo agendamento:', erro);

        this.proximoAgendamento.set(null);

        this.mensagemErro.set(
          'Não foi possível carregar seu próximo agendamento.'
        );

        this.carregandoProximo.set(false);

      }

    });
  }

  converterAgendamento(
    consulta: ConsultaResponse
  ): ProximoAgendamento {

    return {
      tipo: consulta.tipo,
      status: 'Confirmado',
      hospital: consulta.nomeHospital,
      medico: consulta.nomeMedico,
      especialidade: consulta.especialidadeMedico,
      data: this.formatarData(consulta.dataAgendamento),
      horario: consulta.horaAgendamento.substring(0, 5)
    };
  }

  converterDataHora(consulta: ConsultaResponse): Date {

    const data = consulta.dataAgendamento.substring(0, 10);
    const horario = consulta.horaAgendamento.substring(0, 5);

    const [ano, mes, dia] = data.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);

    return new Date(ano, mes - 1, dia, hora, minuto);
  }

  formatarData(data: string): string {

    const [ano, mes, dia] = data.substring(0, 10)
      .split('-')
      .map(Number);

    const dataFormatada = new Date(ano, mes - 1, dia);

    return dataFormatada.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long'
    });
  }
}