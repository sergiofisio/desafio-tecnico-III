import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PatientModel } from '../../models/patient.model';
import { Patient } from './../../services/patient';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-list.html',
})
export class PatientList implements OnInit {
  patients: PatientModel[] = [];
  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  pageSize = 10;
  totalPatients = 0;

  constructor(private patientService: Patient) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.error = null;
    this.patientService
      .getPatients(this.currentPage, this.pageSize)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.patients = response.data;
          this.totalPatients = response.total;
        },
        error: () => {
          this.error = 'Falha ao carregar pacientes. Tente novamente.';
        },
      });
  }
}
