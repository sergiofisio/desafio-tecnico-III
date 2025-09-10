import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PatientModel } from '../../../patients/models/patient.model';
import { Exam } from '../../services/exam';
import { Patient } from '../../../patients/services/patient';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './exam-create.html',
})
export class ExamCreate implements OnInit {
  examForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  patients: PatientModel[] = [];
  modalities = ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'];

  constructor(
    private fb: FormBuilder,
    private examService: Exam,
    private patientService: Patient,
    private router: Router
  ) {
    this.examForm = this.fb.group({
      patientId: ['', Validators.required],
      modality: ['', Validators.required],
      examDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients(1, 100).subscribe((response) => {
      this.patients = response.data;
    });
  }

  onSubmit(): void {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formValue = this.examForm.value;
    const examPayload = {
      ...formValue,
      idempotencyKey: crypto.randomUUID(),
    };

    this.examService
      .createExam(examPayload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.router.navigate(['/exams']),
        error: (err) => {
          this.error = err.error.message || 'Ocorreu um erro ao salvar o exame.';
        },
      });
  }
}
