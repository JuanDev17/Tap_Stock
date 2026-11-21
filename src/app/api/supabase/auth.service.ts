import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';
import { User } from '@supabase/supabase-js';
import { HouseholdService } from './household.service';

@Injectable({
    providedIn: 'root'
})

export class AuthService {

private supabase = inject(SupabaseService);
private router = inject(Router);
private householdService = inject(HouseholdService);

loading = false;


    // Send magic link to user's email
    async sendOtpEmail(email: string): Promise<void> {

        const { error } =
            // await waits for the async operation to settle
            await this.supabase.client.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,

                    // Where Supabase redirects after the user clicks the magic link
                    // TODO: add actual link to redirect user
                    emailRedirectTo: 'http://localhost:4200/'
                }
            });

        if (error) {
            // Allow the component to catch the error and display it
            throw error;
        }
    }

    // Listen for authentication changes
  listenForAuthChanges(): void {

  this.supabase.client.auth.onAuthStateChange(
    (event, session) => {

      console.log('Auth event:', event);
      console.log('Session:', session);

      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
        && session
      ) {
        console.log('Authenticated user:', session.user.email);

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      }

      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/signin']);
      }
    }
  );
}


// Determine where the user should go after authentication
async redirectUser(): Promise<void> {

    try {

        const hasHousehold =
            await this.householdService.hasHousehold();

        if (hasHousehold) {

            // Existing household member
            await this.router.navigate(['/dashboard']);

        } else {

            // User needs to create or join a household
            await this.router.navigate(['/household/setup']);

        }

    } catch (error) {

        console.error('Could not determine household status:', error);

    }
}

    // getCurrentUser()
    // Promise because we want the user details once.
    // This returns a snapshot at the moment it is called.
    async getUserDetails(): Promise<User | null> {

        const { data, error } =
            // Methods coming from supabase.client.auth
            await this.supabase.client.auth.getUser();

        if (error) {
            throw error;
        }

        return data.user;
    }

    // signout()
    async signUserOut(): Promise<void> {

        const { error } =
            await this.supabase.client.auth.signOut();

        if (error) {
            throw error;
        }
    }


      async verifyOtpEmail(email: string, code: string): Promise<void>{
        const { data, error } = 
            await this.supabase.client.auth.verifyOtp({
                email,
                // numeric code user received 
                token: code,
                // type tells supabase which OTP flow to use
                type: 'email'
            });

            if(error){
                throw error;
            }

    }

    
}