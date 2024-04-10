import { generateKeyPairSync, privateDecrypt, publicEncrypt } from "crypto";

export function genRsaPair(passphrase:string){
    return generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
            cipher: "aes-256-cbc",
            passphrase
        }
    })
}

export function encriptWithRsa(input: string, publickKey: string) {
    return publicEncrypt(publickKey, Buffer.from(input,"utf-8")).toString("base64")
}

export function decriptWithRsa(input: string, privateKey: string, passphrase:string) {
    return privateDecrypt({
        key: privateKey,
        passphrase
    }, Buffer.from(input, "base64")).toString("utf-8");
}