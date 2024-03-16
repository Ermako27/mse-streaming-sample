import { readFileSync, appendFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { createSessionKey, unwrapKey, decrypt} from './decrypt.js'
import { trackData, sessiondata } from "./keys.js";

const filename = fileURLToPath(import.meta.url);
const dir = dirname(filename);

const concatBuffers = (buffers) => {
    const buffer = new Uint8Array(
        buffers.reduce((acc, buf) => acc + buf.length, 0),
    );

    buffers.reduce((offset, buf) => {
        buffer.set(buf, offset);
        return offset + buf.length;
    }, 0);

    return buffer;
};

function concatEncryptedSegments() {
    const arrayOfSegments = []
    for (let i = 0; i <= 14; i++) {
        const buffer = readFileSync(join(dir, `/segments/${i}.mp4`));
        arrayOfSegments.push(buffer);
    }

    const concatedBuffer = concatBuffers(arrayOfSegments);

    appendFileSync(join(dir, `encrypted.mp4`), concatedBuffer);
}

function createIV(chunkIndex) {
    let tmpIndex = chunkIndex;
    // зарезервировали 16 байт памяти для счетчика iv, Uint8Array(16) - массив из 16 8-битных чисел, 0-255
    const iv = new Uint8Array(16);
    // увеличиваем счетчик на размер ключа – на 16 байт
    for (let byte = 0; byte < 16; ++byte) {
        iv[iv.length - 1 - byte] = tmpIndex & 0xff;
        tmpIndex = tmpIndex >> 8;
    }
    return iv;
}

async function decryptChunkByChunk() {
    const zeroSegmentBuffer = readFileSync(join(dir, `/segments/0.mp4`));
    const arrayOfSegments = [zeroSegmentBuffer];


    const sessionKey = await createSessionKey(sessiondata.infos);
    const unwrappedKey = await unwrapKey(trackData.key, sessionKey);

    console.log(sessionKey, unwrappedKey)

    for (let i = 1; i <= 14; i++) {
        const buffer = readFileSync(join(dir, `/segments/${i}.mp4`));
        const uint8FromBuffer = new Uint8Array(buffer);
        const slicedUint8 = uint8FromBuffer.slice(2080);
        const decryptedArrayBuffer = await decrypt(unwrappedKey, slicedUint8);
        const uint8FromDecryptedArrayBuffer = new Uint8Array(decryptedArrayBuffer);
        uint8FromBuffer.set(uint8FromDecryptedArrayBuffer, 2080);
        arrayOfSegments.push(Buffer.from(uint8FromBuffer));
    }

    const concatedBuffer = concatBuffers(arrayOfSegments);

    appendFileSync(join(dir, `decrypted-chunk-by-chunk.mp4`), concatedBuffer);
}


// concatEncryptedSegments();
decryptChunkByChunk();
