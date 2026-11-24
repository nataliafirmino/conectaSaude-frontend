import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { PacienteService } from '../services/paciente.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage implements OnInit {
  etapaAtual: number = 1;
  cadastroForm!: FormGroup;
  carregando: boolean = false;

  mostrarSenha: boolean = false;
  mostrarSenhaConfirm: boolean = false;

  private readonly camposPorEtapa: Record<number, string[]> = {
    1: ['nome', 'cpf', 'dataNascimento'],
    2: ['telefone', 'cidadeOrigem', 'email'],
    3: ['senha', 'confirmarSenha'],
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pacienteService: PacienteService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.minLength(14)]],
      dataNascimento: ['', [Validators.required, Validators.minLength(10)]],
      telefone: ['', [Validators.required, Validators.minLength(14)]],
      cidadeOrigem: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      confirmarSenha: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.cadastroForm.get(campo);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  senhasNaoCoincidem(): boolean {
    const senha = this.cadastroForm.get('senha')?.value ?? '';
    const confirmarSenha = this.cadastroForm.get('confirmarSenha')?.value ?? '';
    const confirmarControl = this.cadastroForm.get('confirmarSenha');
    const confirmSenhaPreenchida = !!(confirmarControl && (confirmarControl.dirty || confirmarControl.touched));
    return confirmSenhaPreenchida && senha !== confirmarSenha;
  }

  formatarCpf(event: any) {
    let valor = (event?.detail?.value ?? '').replace(/\D/g, '').slice(0, 11);

    valor = valor
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    this.cadastroForm.get('cpf')?.setValue(valor, { emitEvent: false });
    if (event?.target) {
      event.target.value = valor;
    }
  }

  formatarData(event: any) {
    let valor = (event?.detail?.value ?? '').replace(/\D/g, '').slice(0, 8);

    valor = valor
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');

    this.cadastroForm.get('dataNascimento')?.setValue(valor, { emitEvent: false });
    if (event?.target) {
      event.target.value = valor;
    }
  }

  formatarTelefone(event: any) {
    let valor = (event?.detail?.value ?? '').replace(/\D/g, '').slice(0, 11);

    if (valor.length <= 10) {
      valor = valor
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      valor = valor
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }

    this.cadastroForm.get('telefone')?.setValue(valor, { emitEvent: false });
    if (event?.target) {
      event.target.value = valor;
    }
  }

  private formatarDataParaIso(dataBr: string): string {
    const partes = dataBr.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${ano}-${mes}-${dia}`;
    }
    return dataBr;
  }

  private async exibirToast(mensagem: string, cor: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'bottom',
    });
    await toast.present();
  }

  private validarEtapa(etapa: number): boolean {
    const campos = this.camposPorEtapa[etapa] ?? [];
    let valido = true;

    campos.forEach((campo) => {
      const control = this.cadastroForm.get(campo);
      if (control && control.invalid) {
        control.markAsTouched();
        valido = false;
      }
    });

    if (etapa === 3) {
      const senha = this.cadastroForm.get('senha')?.value ?? '';
      const confirmar = this.cadastroForm.get('confirmarSenha')?.value ?? '';
      if (senha !== confirmar) {
        this.cadastroForm.get('confirmarSenha')?.markAsTouched();
        valido = false;
      }
    }

    return valido;
  }

  proximaEtapa() {
    if (!this.validarEtapa(this.etapaAtual)) {
      return;
    }

    if (this.etapaAtual < 3) {
      this.etapaAtual++;
    }
  }

  etapaAnterior() {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    } else {
      this.voltarParaLogin();
    }
  }

  voltarParaLogin() {
    this.router.navigate(['/login']);
  }

  finalizarCadastro() {
    if (!this.validarEtapa(3) || this.carregando) {
      return;
    }

    const valores = this.cadastroForm.value;
    const payload = {
      nome: valores.nome.trim(),
      cpf: valores.cpf.trim(),
      dataNascimento: this.formatarDataParaIso(valores.dataNascimento),
      telefone: valores.telefone.trim(),
      cidadeOrigem: valores.cidadeOrigem.trim(),
      email: valores.email.trim(),
      senha: valores.senha,
    };

    this.carregando = true;
    this.pacienteService.cadastrar(payload).subscribe({
      next: async () => {
        this.carregando = false;
        await this.exibirToast('Cadastro realizado com sucesso!', 'success');
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        this.carregando = false;
        const msgErro =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Não foi possível concluir o cadastro. Verifique os dados informados.';
        await this.exibirToast(msgErro, 'danger');
      },
    });
  }
}