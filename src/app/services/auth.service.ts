import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface SessaoUsuario {
  id: number | null;
  nome: string | null;
  email: string | null;
  perfil: string | null; // "ROLE_PACIENTE" ou "ROLE_ADMIN"
  autenticado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private sessaoAtual: SessaoUsuario | null = null;

  constructor(private http: HttpClient) {}

  loginPaciente(dados: LoginPayload): Observable<SessaoUsuario> {
    return this.http
      .post<SessaoUsuario>(`${this.apiUrl}/auth`, dados, { withCredentials: true })
      .pipe(tap((sessao) => (this.sessaoAtual = sessao)));
  }

  loginAdmin(dados: LoginPayload): Observable<SessaoUsuario> {
    return this.http
      .post<SessaoUsuario>(`${this.apiUrl}/admin/auth`, dados, { withCredentials: true })
      .pipe(tap((sessao) => (this.sessaoAtual = sessao)));
  }

  obterSessao(): Observable<SessaoUsuario> {
    return this.http
      .get<SessaoUsuario>(`${this.apiUrl}/auth/sessao`, { withCredentials: true })
      .pipe(tap((sessao) => (this.sessaoAtual = sessao)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => (this.sessaoAtual = null)));
  }

  getUsuarioLogado(): SessaoUsuario | null {
    return this.sessaoAtual;
  }
}