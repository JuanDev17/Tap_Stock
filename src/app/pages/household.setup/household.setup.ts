import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HouseholdSignup } from '../../components/household.signup/household.signup';


type HouseholdType = 'create' | 'join'

@Component({
  imports: [CommonModule, HouseholdSignup ],
  selector: 'app-household-setup',
  styleUrl: './household.setup.scss',
  templateUrl: './household.setup.html',
})



export class HouseholdSetup {

  mode: HouseholdType = 'create';

}
