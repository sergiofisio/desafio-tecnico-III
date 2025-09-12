import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedExams } from '../models/exam.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Exam {
  private apiUrl = `${environment.apiUrl}/exams`;

  constructor(private http: HttpClient) {}

  getExams(page: number, pageSize: number, patientId?: string): Observable<PaginatedExams> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (patientId) params = params.append('patientId', patientId);
    return this.http.get<PaginatedExams>(this.apiUrl, { params });
  }

  createExam(exam: Partial<Exam>): Observable<Exam> {
    return this.http.post<Exam>(this.apiUrl, exam);
  }

  deleteExam(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
