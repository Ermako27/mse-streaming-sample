import { readFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { createSessionKey, unwrapKey, decrypt} from './decrypt.js'
import { trackData, sessiondata } from './keys.js';

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

/**
 * Склеиваем все сегменты в один файл без расшифровки
 */
function concatEncryptedSegments() {
    const arrayOfSegments = []
    for (let i = 0; i <= 14; i++) {
        const buffer = readFileSync(join(dir, `/segments/${i}.mp4`));
        arrayOfSegments.push(buffer);
    }
    const concatedBuffer = concatBuffers(arrayOfSegments);
    appendFileSync(join(dir, `/encrypted/encrypted.mp4`), concatedBuffer);
}

/**
 * Расшифруем каждый фрейм в каждом сегменте и склеиваем всё воедино
 * Сегмент зашифрован не полностью, только содержимое после [styp] заголовка.
 *
 * Данный код переписан из https://play.qobuz.com/resources/7.1.3-b011/bundle.js
 */
async function decryptChunkByChunk() {
    const zeroSegmentBuffer = readFileSync(join(dir, `/segments/0.mp4`));
    const arrayOfDecryptedSegments = [zeroSegmentBuffer];


    const sessionKey = await createSessionKey(sessiondata.infos);
    const unwrappedKey = await unwrapKey(trackData.key, sessionKey);

    for (let i = 1; i <= 14; i++) {
        const buffer = readFileSync(join(dir, `/segments/${i}.mp4`));
        // отступаем от начала файла 24 байта, чтобы пропустить [styp]
        const o = 24

        let a = o + 28
        const d = buffer.readUInt32BE(a);
        a += 4
        const f = buffer.readUInt8(a);
        a += 1
        let p = o + d;
        // считаем количество фреймов
        const h = buffer.readUIntBE(a, 3);
        a += 3;

        // дешифруем фреймы
        for (let y = 0; y < h; y++) {
            // считаем границы, в которых находится фрейм в буффере.
            const g = buffer.readUInt32BE(a);
            a += 6;
            const v = buffer.readUInt16BE(a);
            a += 2;
            const b = p
            p = p + g;

            // в случае данного файла дешифруем фреймы через одного, пока не понял почему и что такое v
            if (v === 1) {
                // достаем фрейм
                const bufferSlice = buffer.slice(b, p);
                // генерируем iv
                const iv = new Uint8Array(16)
                buffer.copy(iv, 0, a, a + f);

                const decryptedBuffer = await decrypt(unwrappedKey, iv, bufferSlice);
                // в исходном буфере заменяем зашифрованные байты на расшифрованные
                buffer.set(Buffer.from(decryptedBuffer), b);
            }
            a += f;
        }

        arrayOfDecryptedSegments.push(buffer);
    }

    const concatedBuffer = concatBuffers(arrayOfDecryptedSegments);

    appendFileSync(join(dir, `/decrypted/decrypted.mp4`), concatedBuffer);
}

decryptChunkByChunk();
