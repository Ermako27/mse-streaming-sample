export function playMediaSource(audio: HTMLMediaElement) {
    if (MediaSource.isTypeSupported('audio/mp4; codecs="flac"')) {
        const mediaSource = new MediaSource();
        audio.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', function() {
            URL.revokeObjectURL(audio.src);

            const sourceBuffer = mediaSource.addSourceBuffer('audio/mp4; codecs="flac"');

            console.log('Fetching audio file...');
            fetch('https://strm-test.msermakov.music.dev.yandex.ru/11/flac-fragmented-mp4-11.mp4')
                .then(response => response.arrayBuffer())
                .then(data => {
                    sourceBuffer.appendBuffer(data);
                    sourceBuffer.addEventListener('updateend', function() {
                        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
                            mediaSource.endOfStream();
                            console.log('Audio is ready to play!');
                        }
                    });
                });
        });
    } else {
        console.log('FLAC in ISO-BMFF with MSE is not supported on this platform.');
    }
}
