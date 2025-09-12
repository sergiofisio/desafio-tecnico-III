import { Routes } from '@angular/router';
import { PatientList } from './components/patient-list/patient-list';
import { PatientCreate } from './components/patient-create/patient-create';
import { PatientDetail } from './components/patient-detail/patient-detail';
import { PatientEdit } from './components/patient-edit/patient-edit';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    component: PatientList,
    data: { animation: 'ListPage' },
  },
  {
    path: 'new',
    component: PatientCreate,
    data: { animation: 'CreatePage' },
  },
  {
    path: ':id',
    component: PatientDetail,
    data: { animation: 'DetailPage' },
  },
  { path: ':id/edit', component: PatientEdit, data: { animation: 'EditPage' } },
];
