import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }
  // Khóa phải có độ dài /32 bytes cho AES-256
  // IV phải có độ dài 32 bytes

  encrypt(plaintext: string, key:string): {
    encryptMessage: string;
    iv: string;
  } {
    const privateKey = CryptoJS.enc.Hex.parse(key);
    const iv = CryptoJS.lib.WordArray.random(32);
    const encrypted = CryptoJS.AES.encrypt(plaintext, privateKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return {
      encryptMessage: encrypted.toString(),
      iv: iv.toString(CryptoJS.enc.Hex),    
    };
  }

  decrypt(ciphertext: string, key: string, iv: string): string {
    const privateKey = CryptoJS.enc.Hex.parse(key);
    if (!iv) {
      return ciphertext;
    }
    const ivParse = CryptoJS.enc.Hex.parse(iv);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, privateKey, {
      iv: ivParse,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    console.log("[decryteBytes]", decrypted);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
