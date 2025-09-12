export interface Document {
  id: string;
  type: 'RG' | 'CPF' | 'PASSPORT' | 'OTHER';
  document: string;
  other?: string;
}

export interface PatientModel {
  id: string;
  name: string;
  birthDate: string;
  documents: Document[];
}

export interface PaginatedPatients {
  data: PatientModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
