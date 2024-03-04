import {useEffect, useRef} from "react";
import {playMediaSource} from "./MediaSource.ts";
import {playDash} from "./Shaka.ts";

enum PlayerTypes {
    SHAKA = 'shaka',
    MSE = 'mse'
}

export function App() {
    const audioRef = useRef<HTMLAudioElement>(null);

    const playerType: PlayerTypes = PlayerTypes.MSE



    useEffect(() => {
        if (!audioRef.current) {
            return
        }

        if (playerType === PlayerTypes.MSE) {
            playMediaSource(audioRef.current)
        } else {
            playDash(audioRef.current);
        }
    },[])


    return (
        <>
            <audio ref={audioRef} controls></audio>
        </>
    )
}
