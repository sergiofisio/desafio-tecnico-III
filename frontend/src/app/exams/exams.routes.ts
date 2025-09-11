import { Routes } from '@angular/router';
import { ExamCreate } from './components/exam-create/exam-create';

export const EXAMS_ROUTES: Routes = [
  {
    path: 'new',
    component: ExamCreate,
    data: { animation: 'CreatePage' },
  },
  {
    path: '',
    redirectTo: 'new',
    pathMatch: 'full',
  },
];
