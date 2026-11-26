import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface SessaoUsuario {
  id: number | null;
  idPaciente: number | null;
  nome: string | null;
  email: string | null;
  perfil: string | null; 
  autenticado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private sessaoAtual = signal<SessaoUsuario | null>(null);

  usuarioNome = signal<string>('Paciente');

  constructor(private http: HttpClient) { }

  loginPaciente(dados: LoginPayload): Observable<SessaoUsuario> {
    return this.http.post<SessaoUsuario>(
      `${this.apiUrl}/auth`,
      dados,
      { withCredentials: true }
    ).pipe(
      tap(sessao => this.atualizarSessao(sessao))
    );
  }

  loginAdmin(dados: LoginPayload): Observable<SessaoUsuario> {
    return this.http.post<SessaoUsuario>(
      `${this.apiUrl}/admin/auth`,
      dados,
      { withCredentials: true }
    ).pipe(
      tap(sessao => this.atualizarSessao(sessao))
    );
  }

  obterSessao(): Observable<SessaoUsuario> {
    return this.http.get<SessaoUsuario>(
      `${this.apiUrl}/auth/sessao`,
      { withCredentials: true }
    ).pipe(
      tap(sessao => this.atualizarSessao(sessao))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.sessaoAtual.set(null);
        this.usuarioNome.set('Paciente');
      })
    );
  }

  private atualizarSessao(sessao: SessaoUsuario): void {
    this.sessaoAtual.set(sessao);
    this.usuarioNome.set(
      sessao.nome ? sessao.nome.split(' ')[0] : 'Paciente'
    );
  }

  getUsuarioLogado(): SessaoUsuario | null {
    return this.sessaoAtual();
  }
}