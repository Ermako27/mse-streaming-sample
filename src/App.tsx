import {useEffect, useRef} from "react";
import { createMediaSource } from "./createMediaSource";

const audioFiles = {
    /**
     * mp4(fmp4(flac)) – проигрывается успешно, когда скачиваем начиная с 14263 байта и получаем fmp4(flac)
     */
    fmp4Flac: {
        url: 'https://cdn-demo.s3.yandex.net/654d34b5-1c79-4a0b-a24d-af7841e0ee14/STRM-9313-flac-samples/ff-13-fmp4-in-mp4.mp4',
        mimeType: 'audio/mp4; codecs="flac"',
        offset: 14263
    },
    /**
     * чистый aac – проигрывается успешно
     */
    rawAac: {
        url: 'https://strm-test.msermakov.music.dev.yandex.ru/aac-sample-1.aac',
        mimeType: 'audio/aac'
    },
    /**
     * mp4(mp3) – проигрывается успешно
     */
    mp3InMp4: {
        url: 'https://strm-test.msermakov.music.dev.yandex.ru/mp3-samples/2/mp3-in-mp4-320.mp3',
        mimeType: 'audio/mpeg'
    },
    /**
     * mp4(aac) – не проигрывается
     * в chrome://media-internals ошибка
     * "Failure parsing MP4: Detected unfragmented MP4. Media Source Extensions require ISO BMFF moov to contain mvex to indicate that Movie Fragments are to be expected."
     */
    aacInMp4: {
        url: 'https://strm-test.msermakov.music.dev.yandex.ru/acc-samples/2/acc-in-mp4-192.aac',
        mimeType: 'audio/mp4; codecs="mp4a.40.2"'
    },
    /**
     * mp4(aac) – не проигрывается
     * в chrome://media-internals ошибка
     * "Failure parsing MP4: Detected unfragmented MP4. Media Source Extensions require ISO BMFF moov to contain mvex to indicate that Movie Fragments are to be expected."
     */
    heaacInMp4: {
        url: 'https://strm-test.msermakov.music.dev.yandex.ru/acc-samples/1/g64he-in-mp4.aac',
        mimeType: 'audio/mp4; codecs="mp4a.40.5"'
    },
    /**
     * чистый flac – не проигрывается ни в одном браузере кроме Safari
     * MediaSource.isTypeSupported('audio/flac') == false
     */
    rawFlac: {
        url: 'https://strm-test.msermakov.music.dev.yandex.ru/flac-samples/flac-raw/flac-raw.flac',
        mimeType: 'audio/flac'
    }
}


export function App() {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = createMediaSource(audioFiles.mp3InMp4);
        }

    },[]);

    return (
        <>
            <audio ref={audioRef} controls></audio>
        </>
    )
}
