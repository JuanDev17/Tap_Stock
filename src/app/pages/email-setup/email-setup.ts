import { Component, inject } from '@angular/core';
import { EmailSignup } from '../../components/email-signup/email-signup';
import { AuthService } from '../../api/supabase/auth.service';

@Component({
  imports: [EmailSignup],
  selector: 'app-email-setup',
  styleUrl: './email-setup.scss',
  templateUrl: './email-setup.html',
})
export class EmailSetup {
  #authService = inject(AuthService);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  async emailSubmit(email: string): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.#authService.sendSignInLink(email);
      this.successMessage = 'Sign-in email sent. Check your inbox and spam folder.';
    } catch (error) {
      console.error('Email submission failed:', error);
      this.errorMessage = error instanceof Error
        ? error.message
        : 'Unable to send sign-in email.';
    } finally {
      this.isLoading = false;
    }
  }
}