import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PacienteCadastroPayload {
  nome: string;
  cpf: string;
  dataNascimento: string; 
  telefone: string;
  cidadeOrigem: string;
  email: string;
  senha: string;
}

export interface PacienteResponse {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  cidadeOrigem: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private readonly baseUrl = `${environment.apiUrl}/paciente`;

  constructor(private http: HttpClient) {}

  cadastrar(dados: PacienteCadastroPayload): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(this.baseUrl, dados, {
      withCredentials: true
    });
  }
}