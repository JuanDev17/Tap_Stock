import { Routes } from '@angular/router';
import { HouseholdSetup } from './pages/household.setup/household.setup';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'household/setup',
    component: HouseholdSetup
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];