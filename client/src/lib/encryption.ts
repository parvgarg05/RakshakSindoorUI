import CryptoJS from 'crypto-js';

const DEFAULT_KEY = 'RAKSHAK_SINDOOR_DEMO_KEY_2024';

export function encryptMessage(message: string, key: string = DEFAULT_KEY): string {
  const encrypted = CryptoJS.AES.encrypt(message, key).toString();
  return encrypted;
}

export function decryptMessage(encryptedMessage: string, key: string = DEFAULT_KEY): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return '[Decryption Failed]';
  }
}

export function generateCodeLanguage(message: string): string {
  const words = message.split(' ');
  return words.map(word => {
    const hash = CryptoJS.MD5(word).toString().substring(0, 6);
    return `${word[0].toUpperCase()}${hash}`;
  }).join('-');
}
