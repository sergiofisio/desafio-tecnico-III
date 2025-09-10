import { Routes } from '@angular/router';
import { ExamList } from './components/exam-list/exam-list';
import { ExamCreate } from './components/exam-create/exam-create';

export const EXAMS_ROUTES: Routes = [
  {
    path: '',
    component: ExamList,
  },
  {
    path: 'new',
    component: ExamCreate,
  },
];
