import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EmailSignup } from '../../components/email-signup/email-signup';
import { AuthService } from '../../api/supabase/auth.service';

@Component({
  imports: [CommonModule, EmailSignup],
  selector: 'app-email-setup',
  styleUrl: './email-setup.scss',
  templateUrl: './email-setup.html',
})
export class EmailSetup {

  #authService = inject(AuthService);
  #router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // preserving the email - state
  email = ''; 

  async emailSubmit(email: string): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.email = email;

    try {
      await this.#authService.sendOtpEmail(email);
      this.successMessage = 'Verification code sent to your email.';
    } catch (error) {
      console.error('Email submission failed:', error);
      this.errorMessage = 'Unable to send verification code.';
    } finally {
      this.isLoading = false;
    }
  }

  async verifyOtp(email: string, code: string): Promise<void> {
  if (this.isLoading) return;

  this.isLoading = true;
  this.errorMessage = '';

  try {
    await this.#authService.verifyOtpEmail(email, code);
    await this.#router.navigate(['/household/setup']);
  } catch (error) {
    console.error('OTP verification failed:', error);
    this.errorMessage = 'Invalid or expired verification code.';
  } finally {
    this.isLoading = false;
  }
}


}