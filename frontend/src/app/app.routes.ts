import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { Login } from './auth/components/login/login';
import { Register } from './auth/components/register/register';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    canActivate: [publicGuard],
  },
  {
    path: 'login',
    component: Login,
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [publicGuard],
  },
  {
    path: 'patients',
    loadChildren: () => import('./patients/patients.routes').then((m) => m.PATIENTS_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'exams',
    loadChildren: () => import('./exams/exams.routes').then((m) => m.EXAMS_ROUTES),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'patients' },
];
