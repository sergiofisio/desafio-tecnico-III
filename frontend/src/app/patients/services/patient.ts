import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedPatients, PatientModel } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class Patient {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(page: number, pageSize: number): Observable<PaginatedPatients> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedPatients>(this.apiUrl, { params });
  }

  getPatientById(id: string): Observable<PatientModel> {
    return this.http.get<PatientModel>(`${this.apiUrl}/${id}`);
  }

  createPatient(patient: Partial<PatientModel>): Observable<PatientModel> {
    return this.http.post<PatientModel>(this.apiUrl, patient);
  }
}
