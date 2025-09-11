import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Patient } from '../../services/patient';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';
import { NgxMaskDirective } from 'ngx-mask';
import { CardComponent } from '../../../shared/components/card/card';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    InputComponent,
    CardComponent,
    PageHeader,
    NgxMaskDirective,
  ],
  templateUrl: './patient-create.html',
})
export class PatientCreate {
  patientForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  readonly allDocumentTypes = ['RG', 'CPF'];

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

  getAvailableDocumentTypes(currentIndex: number): string[] {
    const usedTypes = this.documents.value
      .map((doc: any, index: number) => (index !== currentIndex ? doc.type : null))
      .filter(Boolean);
    return this.allDocumentTypes.filter((type) => !usedTypes.includes(type));
  }

  canAddDocument(): boolean {
    return this.documents.length < this.allDocumentTypes.length;
  }

  getDocumentMask(index: number): string {
    const type = this.documents.at(index).get('type')?.value;
    if (type === 'CPF') {
      return '000.000.000-00';
    }
    if (type === 'RG') {
      return '00.000.000-A';
    }
    return '';
  }

  createDocumentGroup(): FormGroup {
    return this.fb.group({
      type: ['CPF', Validators.required],
      document: ['', Validators.required],
      other: [''],
    });
  }

  addDocument(): void {
    if (!this.canAddDocument()) return;

    const availableTypes = this.allDocumentTypes.filter(
      (type) => !this.documents.value.some((doc: any) => doc.type === type)
    );

    const newDocGroup = this.fb.group({
      type: [availableTypes[0] || '', Validators.required],
      document: ['', Validators.required],
    });

    this.documents.push(newDocGroup);
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
