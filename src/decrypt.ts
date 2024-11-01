export interface DecryptAudioParams {
    /**
     * Ключ для расшифровки
     */
    key: string;
    /**
     * Данные для расшифровки
     */
    data: ArrayBuffer;
    /**
     * Количество уже загруженных байт для вычисления iv
     */
    loadedBytes: number;
}

const fromHex = (hexString: string): Uint8Array => {
    const matched = hexString.match(/.{1,2}/g);
    // @ts-ignore
    return new Uint8Array(matched.map((byte: string) => parseInt(byte, 16)));
};

function createIV(chunkIndex: number): Uint8Array {
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

export function decrypt(params: DecryptAudioParams): Promise<ArrayBuffer> {
    const { key, data, loadedBytes } = params;

    return crypto.subtle
        .importKey(
            'raw',
            fromHex(key),
            {
                name: 'AES-CTR'
            },
            false,
            ['encrypt', 'decrypt']
        )
        .then((decryptKey: CryptoKey) => {
            /**
             * AES-CTR-128 - алгоритм блочного шифрования с счетчиком.
             * Длина блока 128 бит или 16 байт
             *
             * Для расшифровки каждого чанка нужно вычислить номер блока, с которого начнется расшифровка
             * chunkIndex - номер блока, для его вычисления делим кол-во загруженных байт на 16
             * iv (счетчик) - размер iv равен размеру блока 128 бит (16 байт)
             */
            const chunkIndex = loadedBytes / 16;
            const iv = createIV(chunkIndex);


            return crypto.subtle.decrypt(
                {
                    name: 'AES-CTR',
                    counter: iv,
                    length: 128
                },
                decryptKey,
                data
            );
        });
}
