import {useEffect, useRef} from "react";
import { createMediaSource } from "./createMediaSource";

export function App() {
    const audioRef = useRef<HTMLAudioElement>(null);

    const audioFiles = {

        rawFlac: {
            url: 'https://strm-test.msermakov.music.dev.yandex.ru/flac-samples/flac-raw/flac-raw.flac',
            mimeType: 'audio/flac'
        },
        fmp4Flac: {
            url: 'https://cdn-demo.s3.yandex.net/654d34b5-1c79-4a0b-a24d-af7841e0ee14/STRM-9313-flac-samples/ff-13-fmp4-in-mp4.mp4',
            mimeType: 'audio/mp4; codecs="flac"'
        }
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = createMediaSource(audioFiles.fmp4Flac);
        }

    },[]);

    return (
        <>
            <audio ref={audioRef} controls></audio>
        </>
    )
}
