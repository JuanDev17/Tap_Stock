import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-email-signup',
  styleUrl: './email-signup.scss',
  templateUrl: './email-signup.html',
})
export class EmailSignup {
  @Input() disabled = false;

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    })
  });

  @Output() submitted = new EventEmitter<string>();

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.controls.email.value);
  }
}