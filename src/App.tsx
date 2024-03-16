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
            url: 'https://strm-test.msermakov.music.dev.yandex.ru/flac-samples/11/flac-fragmented-mp4-11.mp4',
            mimeType: 'audio/mp4; codecs="flac"'
        }
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = createMediaSource(audioFiles.rawFlac);
        }

    },[]);

    return (
        <>
            <audio ref={audioRef} controls></audio>
        </>
    )
}
