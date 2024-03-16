// @ts-ignore
import MSEAudioWrapper from "mse-audio-wrapper";

interface CreateMediaSourceParams {
    url: string,
    mimeType: string
}

export function createMediaSource({ url, mimeType }: CreateMediaSourceParams): string {
    // Создаем MSE
    const mediaSource = new MediaSource();

    const audioWrapper = new MSEAudioWrapper(mimeType);

    // Полный размер файла
    let size: number | null = null;
    const chunkSize = 64 * 1024;

    // Кол-во загруженных байтов
    let loadedBytes = 0;

    // Обработчик открытия SourceBuffer
    const onSourceOpen = (): void => {

        // Создаем sourceBuffer, в который будем складывать чанки байт
        // const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

        const getByteRange = async (): Promise<void> => {
            let end = 0;
            if (size === null || loadedBytes + chunkSize < size) {
                end = loadedBytes + chunkSize;
            } else if (loadedBytes + chunkSize >= size) {
                end = size;
            }

            const response = await fetch(url, {
                headers: {
                    Range: `bytes=${loadedBytes}-${end}`
                }
            });

            if (size === null) {
                size = Number(response.headers.get('content-range')!.split('/')[1]);
            }

            const buffer = await response.arrayBuffer();

            loadedBytes += Number(response.headers.get('content-length')!);


            // const fragments = [...audioWrapper.iterator([buffer])];
            // console.log('fragments', fragments);
            // // debugger
            for (const wrappedAudio of audioWrapper.iterator([buffer])) {
                console.log('wrappedAudio', wrappedAudio)
            }

            if (size !== null && loadedBytes < size) {
                setTimeout(getByteRange, 100)
            }

            // пока что будем ловить переполнение буффера QuotaExceededError
            // sourceBuffer.appendBuffer(buffer);

        };

        // Обработчик добавления чанка байт
        // const onUpdateEnd = (): void => {
        //     // Если скачали не весь файл, то загружаем следующий чанк
        //     if (size !== null && loadedBytes < size) {
        //         setTimeout(getByteRange, 100)
        //     } else {
        //         mediaSource.removeEventListener('sourceopen', onSourceOpen);
        //         sourceBuffer.removeEventListener('updateend', onUpdateEnd);
        //         mediaSource.endOfStream();
        //     }
        // };

        // sourceBuffer.addEventListener('updateend', onUpdateEnd);
        getByteRange();
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);

    return URL.createObjectURL(mediaSource);
}
