import CryptoJS from "crypto-js";

const KEY_AES = "YTBaTmVETkZhRlZoUkhaVlV6Z3lNMkptV0drMWJtWXlPRlkxUVV0WE5FYz0=";

export function encryptData(str: string) {
  // const key = CryptoJS.enc.Base64.parse(KEY_AES); // convert key từ base64
  const encrypted = CryptoJS.AES.encrypt(str, KEY_AES, {
    // mode: CryptoJS.mode.ECB,
    // padding: CryptoJS.pad.Pkcs7,
  }).toString(); // base64 string;
  return encrypted;
}

export function decryptData(encryptedStr: string) {
  const decrypted = CryptoJS.AES.decrypt(encryptedStr, KEY_AES, {
    // mode: CryptoJS.mode.ECB,
    // padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function encryptJson(data: any) {
  return data ? encryptData(JSON.stringify(data)) : "";
}

export function decryptJSON<T = any>(str?: string): T | undefined {
  return str ? JSON.parse(decryptData(str)) : undefined;
}
