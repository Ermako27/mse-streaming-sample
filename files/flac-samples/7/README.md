Пробуем решить проблему 0 duration
перекодируем флак как сказано тут https://stackoverflow.com/questions/60653531/ffmpeg-flac-audio-file-duration-in-metadata-is-0 командой 
```
ffmpeg -i flac-raw.flac -c:v copy -c:a flac re-encoded-flac-raw.flac
```

Команда:
```
ffmpeg -i re-encoded-flac-raw.flac -acodec copy -movflags frag_keyframe+empty_moov+default_base_moof+faststart flac-fragmented-mp4-7.mp4
```

ссылка: https://strm-test.msermakov.music.dev.yandex.ru/flac-samples/7/flac-fragmented-mp4-7.mp4
