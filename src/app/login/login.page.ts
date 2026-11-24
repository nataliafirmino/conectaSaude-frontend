import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  cpfOuEmail: string = '';
  senha: string = '';
  mostrarSenha: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  visibilidadeSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  entrar() {
    this.router.navigate(['/home']);
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }
}