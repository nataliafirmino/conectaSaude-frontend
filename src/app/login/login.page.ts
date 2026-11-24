import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  senha: string = '';
  mostrarSenha: boolean = false;
  carregando: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  visibilidadeSenha() {
    this.mostrarSenha = !this.mostrarSenha;
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

  async entrar() {
    if (this.carregando) {
      return;
    }

    const emailLimpo = this.email.trim();
    if (!emailLimpo || !this.senha) {
      await this.exibirToast('Informe seu e-mail e sua senha.', 'danger');
      return;
    }

    this.carregando = true;
    this.authService.loginPaciente({ email: emailLimpo, senha: this.senha }).subscribe({
      next: async (sessao) => {
        this.carregando = false;
        if (sessao?.autenticado) {
          this.router.navigate(['/home']);
        } else {
          await this.exibirToast('Não foi possível iniciar a sessão.', 'danger');
        }
      },
      error: async (err) => {
        this.carregando = false;
        const msgErro =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'E-mail ou senha inválidos.';
        await this.exibirToast(msgErro, 'danger');
      },
    });
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }
}