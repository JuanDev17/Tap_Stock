import { Routes } from '@angular/router';

import { HouseholdSetup } from './pages/household.setup/household.setup';
import { EmailSetup } from './pages/email-setup/email-setup';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [

  // Default route redirects to sign in
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },

  // Email sign-in page
  {
    path: 'signin',
    component: EmailSetup
  },

  // Dashboard after successful authentication
  {
    path: 'dashboard',
    component: Dashboard
  },

  // Household setup page
  {
    path: 'household/setup',
    component: HouseholdSetup
  },

  // Unknown routes redirect to sign in
  {
    path: '**',
    redirectTo: 'signin'
  }

];