import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Document, PatientModel } from '../../models/patient.model';
import { Patient } from './../../services/patient';
import { finalize } from 'rxjs';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CardComponent } from '../../../shared/components/card/card';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskPipe } from 'ngx-mask';
import { DocumentMaskPipe } from '../../../shared/pipes/document-mask-pipe';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeader,
    CardComponent,
    ButtonComponent,
    NgxMaskPipe,
    DocumentMaskPipe,
  ],
  templateUrl: './patient-list.html',
})
export class PatientList implements OnInit {
  patients: PatientModel[] = [];
  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  pageSize = 10;
  totalPatients = 0;

  constructor(private patientService: Patient, private toastr: ToastrService) {}

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

  deletePatient(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja deletar o paciente "${name}"?`)) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.toastr.success(`Paciente "${name}" deletado com sucesso.`);
          this.loadPatients();
        },
        error: () => this.toastr.error(`Falha ao deletar o paciente.`),
      });
    }
  }
}
