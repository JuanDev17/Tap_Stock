import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HouseholdSignup } from '../../components/household.signup/household.signup';
import { HouseholdService } from '../../api/supabase/household.service';

type HouseholdType = 'create' | 'join';

@Component({
  imports: [HouseholdSignup],
  selector: 'app-household-setup',
  styleUrl: './household.setup.scss',
  templateUrl: './household.setup.html',
})
export class HouseholdSetup {

  mode: HouseholdType = 'create';

  #householdService = inject(HouseholdService);
  #router = inject(Router);

  // isLoading so user dont submit twice
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // async returns a Promise
  async createSubmit(householdName: string): Promise<void> {
    console.log('Parent received household:', householdName);
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // try whats in the block
    try {
      await this.#householdService.createhousehold(householdName);
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

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.#householdService.joinHousehold(inviteCode);
      this.successMessage = 'Successfully joined household!';
      await this.#router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Join household failed:', error);
      this.errorMessage = 'Unable to join household. Check your invitation code.';
    } finally {
      this.isLoading = false;
    }
  }
}