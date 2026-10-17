import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from '../../widgets/contact-form/contact-form.component';
import { TranslatePipe } from '../../i18n/translate.pipe';

type CopyState = 'idle' | 'copied' | 'failed';

@Component({
    selector: 'app-sponsor',
    imports: [CommonModule, ContactFormComponent, TranslatePipe],
    templateUrl: './sponsor.component.html',
    styleUrls: ['./sponsor.component.scss']
})
export class SponsorComponent implements OnDestroy {
  @ViewChild('address') addressRef?: ElementRef<HTMLElement>;

  bscAddress = '0x6ea43c866b82da77b55aa561dc0de58cb69ad066';
  bscQRCode = 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/bscAddr.jpg';
  kofiLink = 'https://ko-fi.com/lazyrhythm';

  copyState: CopyState = 'idle';
  private resetTimer?: ReturnType<typeof setTimeout>;

  async copyBscAddress(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.bscAddress);
      this.setCopyState('copied');
    } catch {
      // Clipboard access can be blocked; select the address so it can be copied by hand.
      this.selectAddress();
      this.setCopyState('failed');
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.resetTimer);
  }

  private setCopyState(state: CopyState): void {
    clearTimeout(this.resetTimer);
    this.copyState = state;
    this.resetTimer = setTimeout(() => this.copyState = 'idle', state === 'copied' ? 2500 : 6000);
  }

  private selectAddress(): void {
    const element = this.addressRef?.nativeElement;
    const selection = window.getSelection();
    if (!element || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
