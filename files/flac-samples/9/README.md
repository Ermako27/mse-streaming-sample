команда:
```
ffmpeg -i ../flac-raw.flac -f mp4 -vn  -acodec copy -movflags frag_keyframe+empty_moov+default_base_moof+dash+global_sidx -frag_duration 3000000 flac-fragmented-mp4-9.mp4
```
ссылка: https://strm-test.msermakov.music.dev.yandex.ru/flac-samples/9/flac-fragmented-mp4-9.mp4

платформы:
1. веб +
2. ios -
3. android +
