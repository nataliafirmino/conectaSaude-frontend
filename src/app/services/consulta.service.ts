import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HospitalItem {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  ativo: boolean;
}

export interface MedicoItem {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
  ativo: boolean;
  idHospital?: number;
  hospitaisIds?: number[];
}

export interface ConsultaPayload {
  tipo: string;
  dataAgendamento: string;
  horaAgendamento: string;
  idPaciente: number;
  idHospital: number;
  idMedico: number;
}

export interface ConsultaResponse {
  id: number;
  tipo: string;
  dataAgendamento: string;
  horaAgendamento: string;
  status: 'AGENDADA' | 'CANCELADA' | 'REALIZADA';
  idPaciente: number;
  nomePaciente: string;
  idHospital: number;
  nomeHospital: string;
  idMedico: number;
  nomeMedico: string;
  especialidadeMedico: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarHospitaisAtivos(): Observable<HospitalItem[]> {
    return this.http.get<HospitalItem[]>(
      `${this.apiUrl}/hospital/ativos`,
      { withCredentials: true }
    );
  }

  listarMedicosPorHospital(idHospital: number): Observable<MedicoItem[]> {
    return this.http.get<MedicoItem[]>(
      `${this.apiUrl}/medico/hospital/${idHospital}`,
      { withCredentials: true }
    );
  }

  agendarConsulta(dados: ConsultaPayload): Observable<ConsultaResponse> {
    return this.http.post<ConsultaResponse>(
      `${this.apiUrl}/consulta`,
      dados,
      { withCredentials: true }
    );
  }

  listarPorPaciente(idPaciente: number): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(
      `${this.apiUrl}/consulta/paciente/${idPaciente}`,
      { withCredentials: true }
    );
  }

  cancelarConsulta(id: number): Observable<ConsultaResponse> {
    return this.http.patch<ConsultaResponse>(
      `${this.apiUrl}/consulta/${id}`,
      {},
      { withCredentials: true }
    );
  }
}