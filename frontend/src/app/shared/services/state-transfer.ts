import { Injectable } from '@angular/core';
import { PatientModel } from '../../patients/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class StateTransfer {
  private patientContext: PatientModel | null = null;

  setPatientContext(patient: PatientModel): void {
    this.patientContext = patient;
  }

  getPatientContext(): PatientModel | null {
    const context = this.patientContext;

    this.patientContext = null;

    return context;
  }
}
