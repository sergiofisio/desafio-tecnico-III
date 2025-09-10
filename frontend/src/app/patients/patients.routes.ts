import { Routes } from '@angular/router';
import { PatientList } from './components/patient-list/patient-list';
import { PatientCreate } from './components/patient-create/patient-create';
import { PatientDetail } from './components/patient-detail/patient-detail';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    component: PatientList,
  },
  {
    path: 'new',
    component: PatientCreate,
  },
  {
    path: ':id',
    component: PatientDetail,
  },
];
