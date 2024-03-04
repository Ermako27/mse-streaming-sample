// @ts-ignore
import shaka from 'shaka-player'

// https://strm-test.msermakov.music.dev.yandex.ru/1/dash/stream.mpd
// https://storage.googleapis.com/shaka-demo-assets/dig-the-uke-clear/dash.mpd
async function initPlayer(audio: HTMLMediaElement) {
    // Create a Player instance.
    const player = new shaka.Player();
    await player.attach(audio);

    // Listen for error events.
    player.addEventListener('error', onErrorEvent);

    // Try to load a manifest.
    // This is an asynchronous process.
    try {
        await player.load('https://strm-test.msermakov.music.dev.yandex.ru/1/dash/stream.mpd');
        // This runs if the asynchronous load is successful.
        console.log('The video has now been loaded!');
    } catch (e) {
        // onError is executed if the asynchronous load fails.
        onError(e);
    }
}

function onErrorEvent(event: any) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
}

function onError(error: any) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
}
export function playDash(audio: HTMLMediaElement) {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        initPlayer(audio);
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
    }
}
