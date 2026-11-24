import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';
import { HouseholdService } from './household.service';

@Injectable({
    providedIn: 'root'
})

export class AuthService {

private supabase = inject(SupabaseService);
private router = inject(Router);
private householdService = inject(HouseholdService);

  async sendSignInLink(email: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithOtp({
      email: email.trim(),
    // Use Angular's base URL so deployed subpath apps redirect back correctly.
    options: { emailRedirectTo: globalThis.document.baseURI }
  });

    if (error) throw error;
  }

  listenForAuthChanges(): void {
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        void this.redirectUser();
      } else if (event === 'SIGNED_OUT') {
        void this.router.navigate(['/signin']);
      }
    });
  }

  async redirectUser(): Promise<void> {
    try {
      const path = await this.householdService.hasHousehold()
        ? '/dashboard'
        : '/household/setup';
      await this.router.navigate([path]);
    } catch (error) {
      console.error('Could not determine household status:', error);
    }
  }

  async signUserOut(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) throw error;
  }
}