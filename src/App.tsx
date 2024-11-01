import {useEffect, useRef} from "react";
import { createMediaSource } from "./createMediaSource";
import { files } from "./files";


export function App() {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            const urlParams = new URLSearchParams(window.location.search);
            const file = urlParams.get('file');

            if (!file) {
                throw Error('?file= param not specified');
            }

            // @ts-ignore
            audioRef.current.src = createMediaSource(files[file]);
            audioRef.current.volume = 0.1;
            audioRef.current.addEventListener(
                'timeupdate',
                () => {
                    if (audioRef.current) {
                        console.log('currentTime', audioRef.current.currentTime);
                    }
                }
            )
        }
    },[]);

    return (
        <>
            <audio ref={audioRef} controls autoPlay></audio>
        </>
    )
}
