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
  bitcoinAddress = '1234567890abcdef'; // 替換為實際的比特幣地址
  bitcoinQRCode = 'assets/images/bitcoin-qr.png'; // 替換為實際的 QR code 圖片路徑
  kofiLink = 'https://ko-fi.com/lazyrhythm'; // 替換為實際的 Ko-fi 連結

  copyBitcoinAddress() {
    navigator.clipboard.writeText(this.bitcoinAddress);
    // 可以添加複製成功的提示
    alert('已複製比特幣地址！');
  }
}
