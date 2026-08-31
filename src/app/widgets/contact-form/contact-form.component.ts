import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebsiteDataService } from '../../services/website-data.service';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  @Input() formType: 'contact' | 'sponsor' = 'contact';
  contactForm: FormGroup;
  isSubmitting = false;
  submitted = false;
  submitError = false;

  constructor(
    private fb: FormBuilder,
    private websiteData: WebsiteDataService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.email, Validators.maxLength(320)]],
      subject: ['', Validators.maxLength(300)],
      message: ['', [Validators.required, Validators.maxLength(10000)]],
      amount: [null]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid || this.isSubmitting) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const value = this.contactForm.getRawValue();
    const name = value.name.trim();
    const message = value.message.trim();
    const email = value.email?.trim() || null;

    if (!name || !message) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitted = false;
    this.submitError = false;

    try {
      await this.websiteData.submitContract({
        form_type: this.formType,
        name,
        email,
        subject: value.subject?.trim() || null,
        message,
        amount: this.formType === 'sponsor' && value.amount !== null && value.amount !== ''
          ? Number(value.amount)
          : null
      });

      this.submitted = true;
      this.contactForm.reset({ name: '', email: '', subject: '', message: '', amount: null });
    } catch (error) {
      console.error('Unable to submit contact form', error);
      this.submitError = true;
    } finally {
      this.isSubmitting = false;
    }
  }
}
