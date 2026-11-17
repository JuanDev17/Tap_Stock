import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-email-signup',
  styleUrl: './email-signup.scss',
  templateUrl: './email-signup.html',
})
export class EmailSignup {

  email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email]
  });

  @Output() submitted = new EventEmitter<string>();

  submit(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }

    this.submitted.emit(this.email.value);
  }
}