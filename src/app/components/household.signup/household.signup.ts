import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-household-signup',
  styleUrl: './household.signup.scss',
  templateUrl: './household.signup.html',
})
export class HouseholdSignup {

  @Input() mode: 'create' | 'join' = 'create';

  // managing the field form 
  householdName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)]
  });

  //output
  // emitting an event to the parent
  // this.submitted.emit() 
  @Output() submitted = new EventEmitter<string>();

  submit(){
      console.log('starting:',);

    // household object exist even when user hasnt typed 
    if(this.householdName.invalid){
      this.householdName.markAsTouched();
      return;
    }
  console.log('Emitting:', this.householdName.value);

    // this.householdName is FormControl Object - not actual txt
    this.submitted.emit(this.householdName.value);
  }
}
