import CryptoJS from "crypto-js";

const secretKey = process.env.CRYPTO_SECRET_KEY;

export const encryptData =(data) => {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    return ciphertext;
}
  

export const decryptData = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
}