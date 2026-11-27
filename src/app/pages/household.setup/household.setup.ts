import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HouseholdSignup } from '../../components/household.signup/household.signup';
import { HouseholdService } from '../../api/supabase/household.service';

type HouseholdType = 'create' | 'join';
type SetupStep = 'household' | 'member-name';

@Component({
  imports: [HouseholdSignup, ReactiveFormsModule],
  selector: 'app-household-setup',
  styleUrl: './household.setup.scss',
  templateUrl: './household.setup.html',
})
export class HouseholdSetup {

  mode = signal<HouseholdType>('create');
  step = signal<SetupStep>('household');

  #householdService = inject(HouseholdService);
  #router = inject(Router);

  fullName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)]
  });

  // isLoading so user dont submit twice
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // async returns a Promise
  async createSubmit(householdName: string): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.#householdService.createhousehold(householdName);
      this.step.set('member-name');
      this.successMessage.set('Household created. Add your name to continue.');
    }
    catch (error) {
      console.error('Create household failed:', error);
      this.errorMessage.set('Unable to create household. Please try again.');
    }
    finally {
      this.isLoading.set(false);
    }
  }

  async joinSubmit(inviteCode: string): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.#householdService.joinHousehold(inviteCode);
      this.step.set('member-name');
      this.successMessage.set('You joined the household. Add your name to continue.');
    } catch (error) {
      console.error('Join household failed:', error);
      this.errorMessage.set('Unable to join household. Check your invitation code.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveMemberName(): Promise<void> {
    if (this.isLoading()) return;
    const fullName = this.getFullName();
    if (!fullName) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.#householdService.saveCurrentMemberName(fullName);
      await this.#router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Saving household member name failed:', error);
      this.errorMessage.set('Unable to save your name. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private getFullName(): string | null {
    const fullName = this.fullName.value.trim();

    if (fullName.length < 2) {
      this.fullName.setErrors({ minlength: true });
      this.fullName.markAsTouched();
      return null;
    }

    return fullName;
  }
}