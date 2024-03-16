function unescape(e) {
    return (e + "===".slice((e.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/")
}

function decodeBase64Url(e) {
    return atob(unescape(e))
}

function textToRaw(e) {
    return Uint8Array.from(Array.from(e).map((function(e) {
        return e.charCodeAt(0)
    })))
}

function initialization() {
    // ключи для 53 таймзоны - berlin
    const e = 'OTc5NTQ5NDM3ZmNjNGEzZmFhZDQ4Nj';
    const t = 'diNWNkMjVkY2I=MWNlNTlmYjA5ZDQ2';
    const r = 'NGM4NGJlNmE4YzU4YTQyMDA0OTU=';

    return atob((e + t + r).substr(0, (e + t + r).length - 44))
}

export async function createSessionKey(infos) {
    const splittedInfos = infos.split('.');
    const info = textToRaw(decodeBase64Url(splittedInfos[0]));
    const salt = textToRaw(decodeBase64Url(splittedInfos[1]));

    const o = initialization();
    const s = Uint8Array.from(o.match(/[\s\S]{1,2}/g).map((function(e) {
        return parseInt(e, 16)
    })));

    const deriveKey = await crypto.subtle.importKey("raw", s, {name: "HKDF"}, !1, ["deriveKey", "deriveBits"])
    const sessionKey = await crypto.subtle.deriveKey({
        name: "HKDF",
        hash: "SHA-256",
        salt: info,
        info: salt
    }, deriveKey, {
        name: "AES-CBC",
        length: 128
    }, !1, ["unwrapKey"]);

    return sessionKey;
}

export async function unwrapKey(key, sessionKey) {
    const splittedKey = key.split('.');
    const wrappedKey = textToRaw(decodeBase64Url(splittedKey[1]));
    const iv = textToRaw(decodeBase64Url(splittedKey[2]));

    const unwrappedKey = await  crypto.subtle.unwrapKey("raw", wrappedKey, sessionKey, {
        name: "AES-CBC",
        iv
    }, {
        name: "AES-CTR"
    }, !1, ["decrypt"]);

    return unwrappedKey;
}

export async function decrypt(key, encData) {
    const decData = await crypto.subtle.decrypt({
        name: "aes-ctr",
        counter: new Uint8Array([
            53,
            177,
            55,
            121,
            246,
            15,
            151,
            224,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]),
        length: 128
    }, key, encData);

    return decData;
}


// {
//     "type": "Buffer",
//     "data": [
//     53,
//     177,
//     55,
//     121,
//     246,
//     15,
//     151,
//     224,
//     0,
//     0,
//     0,
//     0,
//     0,
//     0,
//     0,
//     0
// ]
// }
