import { readFileSync, appendFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dir = dirname(filename);


function createFileWithoutMp4Header() {
    const mp4Fmp4FlacFile = join(dir, 'flac-mp4-3');


    const mp4Fmp4FlacBuffer = readFileSync(mp4Fmp4FlacFile);
    const fmp4FlacBuffer = mp4Fmp4FlacBuffer.slice(9991);

    const fmp4FlacFile = join(dir, 'flac-for-dash');
    writeFileSync(fmp4FlacFile, fmp4FlacBuffer);
}

createFileWithoutMp4Header();
