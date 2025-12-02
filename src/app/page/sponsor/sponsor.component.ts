import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from '../../widgets/contact-form/contact-form.component';

@Component({
    selector: 'app-sponsor',
    imports: [CommonModule, ContactFormComponent],
    templateUrl: './sponsor.component.html',
    styleUrls: ['./sponsor.component.scss']
})
export class SponsorComponent {
  bscAddress = '0x6ea43c866b82da77b55aa561dc0de58cb69ad066';
  bscQRCode = 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/bscAddr.jpg';
  kofiLink = 'https://ko-fi.com/lazyrhythm';

  showToast = false;

  copyBscAddress() {
    navigator.clipboard.writeText(this.bscAddress).then(() => {
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 2000);
    });
  }
}
