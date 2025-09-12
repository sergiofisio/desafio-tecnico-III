import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { Document } from '../../models/patient.model';

import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';
import { CardComponent } from '../../../shared/components/card/card';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { NgxMaskDirective } from 'ngx-mask';
import { Patient } from '../../services/patient';

@Component({
  selector: 'app-patient-edit',
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
  templateUrl: './patient-edit.html',
})
export class PatientEdit implements OnInit {
  patientForm: FormGroup;
  patientId: string;
  isSubmitting = false;
  isLoading = true;
  error: string | null = null;
  readonly allDocumentTypes = ['CPF', 'RG'];

  constructor(
    private fb: FormBuilder,
    private patientService: Patient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      birthDate: ['', Validators.required],
      documents: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    });
  }

  ngOnInit(): void {
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }
    this.patientService
      .getPatientById(this.patientId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (patient) => {
          setTimeout(() => {
            this.patientForm.patchValue({
              name: patient.name,
              birthDate: new Date(patient.birthDate).toISOString().split('T')[0],
            });
            patient.documents.forEach((doc) => this.addDocument(doc));
          }, 0);
        },
        error: () => {
          this.error = 'Falha ao carregar dados do paciente.';
          this.toastr.error(this.error);
          this.router.navigate(['/patients']);
        },
      });
  }

  get documents(): FormArray {
    return this.patientForm.get('documents') as FormArray;
  }

  getAvailableDocumentTypes(currentIndex: number): string[] {
    const usedTypes = this.documents.value
      .map((doc: Document, index: number) => (index !== currentIndex ? doc.type : null))
      .filter(Boolean);
    return this.allDocumentTypes.filter((type) => !usedTypes.includes(type));
  }

  canAddDocument(): boolean {
    return this.documents.length < this.allDocumentTypes.length;
  }

  addDocument(doc?: Document): void {
    if (!this.canAddDocument() && !doc) return;

    const availableTypes = this.allDocumentTypes.filter(
      (type) => !this.documents.value.some((d: Document) => d.type === type)
    );

    const newDocGroup = this.fb.group({
      id: [doc?.id],
      type: [doc?.type || availableTypes[0] || '', Validators.required],
      document: [doc?.document || '', Validators.required],
    });
    this.documents.push(newDocGroup);
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

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.patientService
      .updatePatient(this.patientId, this.patientForm.value)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Paciente atualizado com sucesso!');
          this.router.navigate(['/patients', this.patientId]);
        },
        error: (err: any) => {
          this.error = err.error.message || 'Ocorreu um erro ao atualizar o paciente.';
          this.toastr.error(this.error as string);
        },
      });
  }
}
