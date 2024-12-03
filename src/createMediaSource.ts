import { decrypt } from "./decrypt";

interface CreateMediaSourceParams {
    url: string;
    mimeType: string;
    offset: number;
    key: string;
    size: number
}

/**
 * Функция определяет размер первого чанка для загрузки
 * 
 * Размер первого чанка - ближайшее число, кратное 128, которое будет больше суммы
 * offset + chunkSize
 * @param offset - размер mp4 заголовков
 * @param chunkSize - стандартный размер чанка
 * @returns 
 */
function createFirstChunkSize(offset: number, chunkSize: number) {
    const originalSize = offset + chunkSize;
    let result = 0;
    if (originalSize % 128 === 0) {
        result = originalSize + 128
    } else {
        result = (Math.ceil(originalSize / 128)) * 128
    }

    return result
}

export function createMediaSource({ url, mimeType, offset, key, size }: CreateMediaSourceParams): string {
    // Создаем MSE
    const mediaSource = new MediaSource();

    // Полный размер файла

    // Размер чанка должен быть кратен 128
    const chunkSize = 256 * 1024;

    // Кол-во загруженных байт
    let loadedBytes = 0;

    // Обработчик открытия SourceBuffer
    const onSourceOpen = (): void => {

        // Создаем sourceBuffer, в который будем складывать чанки байт
        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

        const getByteRange = (): void => {
            let end = 0;
            if (size === null || loadedBytes + chunkSize < size) {
                if (loadedBytes === 0) {
                    end = createFirstChunkSize(offset, chunkSize) - 1;
                } else {
                    end = loadedBytes + chunkSize - 1;
                }
            } else if (loadedBytes + chunkSize >= size) {
                end = size;
            }

            fetch(url, {
                headers: {
                    Range: `bytes=${loadedBytes}-${end}`
                }
            })
            .then((response) => {
                response.arrayBuffer()
                    .then((buffer) => {
                        decrypt({
                            data: buffer,
                            loadedBytes,
                            key
                        })
                            .then((decryptedBuffer) => {
                                let bufferToAppend: ArrayBuffer = decryptedBuffer;
                                if (loadedBytes === 0) {
                                    bufferToAppend = decryptedBuffer.slice(offset);
                                }
                    
                                loadedBytes += Number(response.headers.get('content-length'));
                                // пока что будем ловить переполнение буффера QuotaExceededError
                                sourceBuffer.appendBuffer(bufferToAppend);  
                            })
                    })
            })
        };

        // Обработчик добавления чанка байт
        const onUpdateEnd = (): void => {
            // Если скачали не весь файл, то загружаем следующий чанк
            if (size !== null && loadedBytes < size) {
                setTimeout(getByteRange, 100)
            } else {
                mediaSource.removeEventListener('sourceopen', onSourceOpen);
                sourceBuffer.removeEventListener('updateend', onUpdateEnd);
                mediaSource.endOfStream();
            }
        };

        sourceBuffer.addEventListener('updateend', onUpdateEnd);
        sourceBuffer.addEventListener('error', (error) => {
            console.error(error)
        })
        getByteRange();
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);
    mediaSource.addEventListener('error', (error) => {
        console.error(error)
    })

    return URL.createObjectURL(mediaSource);
}
