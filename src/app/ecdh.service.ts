import { Injectable } from '@angular/core';
import {ec as EC} from 'elliptic'

@Injectable({
  providedIn: 'root'
})
export class EcdhService {
  private ec:EC;
  constructor() {
    this.ec = new EC('curve25519');
  }

  generateKeyPair() {
    const keyPair = this.ec.genKeyPair();
    return {
      privateKey: keyPair.getPrivate('hex'),
      publicKey: keyPair.getPublic().encode('hex', false)
    };
  }

  deriveSharedKey(privateKey: string, publicKey: string): string {
    const keyPair = this.ec.keyFromPrivate(privateKey, 'hex');
    const sharedKey = keyPair.derive(this.ec.keyFromPublic(publicKey, 'hex').getPublic()).toString(16);
    return sharedKey;
  }

  deriveSharedKeyMultiple(privateKey: string, publicKey: string) {
    // const keyPair = this.ec.keyFromPrivate(privateKey, 'hex');
    // const sharedKey = keyPair.derive(this.ec.keyFromPublic(publicKey, 'hex').getPublic()).toString(16);
    // return sharedKey;
    var A = this.ec.genKeyPair();
    var B = this.ec.genKeyPair();
    var C = this.ec.genKeyPair();

    var AB = A.getPublic().mul(B.getPrivate())
    var BC = B.getPublic().mul(C.getPrivate())
    var CA = C.getPublic().mul(A.getPrivate())

    var ABC = AB.mul(C.getPrivate())
    var BCA = BC.mul(A.getPrivate())
    var CAB = CA.mul(B.getPrivate())

    console.log("ABC:", ABC.getX().toString(16))
    console.log("BCA:",BCA.getX().toString(16))
    console.log("CAB:", CAB.getX().toString(16))
  }
}
