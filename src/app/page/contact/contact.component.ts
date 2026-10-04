import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from '../../widgets/contact-form/contact-form.component';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
    selector: 'app-contact',
    imports: [CommonModule, ContactFormComponent, TranslatePipe],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
}
