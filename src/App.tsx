import {useEffect, useRef} from "react";
import { createMediaSource } from "./createMediaSource";

export function App() {
    const audioRef = useRef<HTMLAudioElement>(null);

    const audioFile = {
        url: 'https://strm-test.msermakov.music.dev.yandex.ru/11/flac-fragmented-mp4-11.mp4',
        mimeType: 'audio/mp4; codecs="flac"'
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = createMediaSource(audioFile.url, audioFile.mimeType);
        }

    },[]);

    return (
        <>
            <audio ref={audioRef} controls></audio>
        </>
    )
}
