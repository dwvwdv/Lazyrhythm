import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from '../../widgets/contact-form/contact-form.component';

@Component({
    selector: 'app-contact',
    imports: [CommonModule, ContactFormComponent],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
}
