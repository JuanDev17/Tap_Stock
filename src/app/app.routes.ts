import { Routes } from '@angular/router';
import { HouseholdSetup } from './pages/household.setup/household.setup';
import { EmailSetup } from './pages/email-setup/email-setup';

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
    path: 'signin',
    component: EmailSetup
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];