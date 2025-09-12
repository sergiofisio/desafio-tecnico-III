import { PatientModel } from '../../patients/models/patient.model';

export interface ExamModel {
  id: string;
  modality: 'CR' | 'CT' | 'DX' | 'MG' | 'MR' | 'NM' | 'OT' | 'PT' | 'RF' | 'US' | 'XA';
  examDate: string; // ou Date
  patientId: string;
  patient: PatientModel;
  idempotencyKey: string;
}

export interface PaginatedExams {
  data: ExamModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
