import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HouseholdSignup } from '../../components/household.signup/household.signup';
import { HouseholdService } from '../../api/supabase/household.service';

type HouseholdType = 'create' | 'join';

@Component({
  imports: [HouseholdSignup, ReactiveFormsModule],
  selector: 'app-household-setup',
  styleUrl: './household.setup.scss',
  templateUrl: './household.setup.html',
})
export class HouseholdSetup {

  mode: HouseholdType = 'create';

  #householdService = inject(HouseholdService);
  #router = inject(Router);

  fullName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)]
  });

  // isLoading so user dont submit twice
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // async returns a Promise
  async createSubmit(householdName: string): Promise<void> {
    if (this.isLoading) return;
    const fullName = this.getFullName();
    if (!fullName) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // try whats in the block
    try {
      await this.#householdService.createhousehold(householdName);
      await this.#householdService.saveCurrentMemberName(fullName);
      this.successMessage = 'Household created successfully!';
      await this.#router.navigate(['/dashboard']);
    } 
    // catch any errors from the block 
    catch (error) {
      console.error('Create household failed:', error);
      this.errorMessage = 'Unable to create household. Please try again.';
    } 
    // runs regardless of passing or failing 
    finally {
      this.isLoading = false;
    }
  }

  async joinSubmit(inviteCode: string): Promise<void> {
    if (this.isLoading) return;
    const fullName = this.getFullName();
    if (!fullName) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.#householdService.joinHousehold(inviteCode);
      await this.#householdService.saveCurrentMemberName(fullName);
      this.successMessage = 'Successfully joined household!';
      await this.#router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Join household failed:', error);
      this.errorMessage = 'Unable to join household. Check your invitation code.';
    } finally {
      this.isLoading = false;
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