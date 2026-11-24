import { Component, inject, signal } from '@angular/core';
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

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  async emailSubmit(email: string): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.#authService.sendSignInLink(email);
      this.successMessage.set('Sign-in email sent. Check your inbox and spam folder.');
    } catch (error) {
      console.error('Email submission failed:', error);
      this.errorMessage.set(error instanceof Error
        ? error.message
        : 'Unable to send sign-in email.');
    } finally {
      this.isLoading.set(false);
    }
  }
}