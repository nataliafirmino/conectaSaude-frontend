import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  usuarioNome = 'Maria';

  proximoAgendamento = {
    tipo: 'Consulta médica',
    status: 'Confirmado',
    hospital: 'Hospital da Restauração',
    profissional: 'Dra. Mariana Costa',
    especialidade: 'Cardiologia',
    data: '24 de junho',
    horario: '09:30'
  };

  constructor(private router: Router) {}

  irParaAgendar() {
    this.router.navigate(['/agendar']);
  }

  irParaConsultas() {
    this.router.navigate(['/consultas']);
  }

  irParaPerfil() {
    this.router.navigate(['/perfil']);
  }
}
