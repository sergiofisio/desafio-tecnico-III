import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Patient } from '../../services/patient';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './patient-create.html',
})
export class PatientCreate {
  patientForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  documentTypes = ['RG', 'CPF', 'PASSPORT', 'OTHER'];

  constructor(private fb: FormBuilder, private patientService: Patient, private router: Router) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      birthDate: ['', Validators.required],
      documents: this.fb.array([this.createDocumentGroup()], Validators.required),
    });
  }

  get documents(): FormArray {
    return this.patientForm.get('documents') as FormArray;
  }

  createDocumentGroup(): FormGroup {
    return this.fb.group({
      type: ['CPF', Validators.required],
      document: ['', Validators.required],
      other: [''],
    });
  }

  addDocument(): void {
    this.documents.push(this.createDocumentGroup());
  }

  removeDocument(index: number): void {
    if (this.documents.length > 1) {
      this.documents.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.patientService
      .createPatient(this.patientForm.value)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.router.navigate(['/patients']),
        error: (err: any) => {
          this.error = err.error.message || 'Ocorreu um erro ao salvar o paciente.';
        },
      });
  }
}
