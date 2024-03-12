## Создаем fmp4 в два шага
Таким образом пытаемся решить проблему, что мобильные платформы и firefox не видят длительность трека

Из чата про lossless
```
1. Я в LossLess чате уже писал, что ffmpeg может выдавать single fragmented mp4 и m3u8 к нему для hls, и длительность там похоже строилась на основе m3u8 файла, плеер ее видел.
2. Но ffmpeg выдает fMP4 без mehd блока, а mp4fragment с таким блоком,  и за счет mehd VLC, видит всю длительность файла без m3u8 манифеста, напрямую читая mp4, а не m3u8 в Open Network Stream
3. И firefox нормально видит длительность, файла фрагментированного mp4fragment, тоже за счет mehd блока.
```


1. Создаем mp4 c помощью ffmpeg
```
ffmpeg -i ../flac-raw/flac-raw.flac -strict -2 -f mp4 -vn  -acodec copy -movflags faststart flac-mp4.mp4
```
2. Создаем fmp4 c помощью mp4fragment из Bento4
```
mp4fragment flac-mp4.mp4 --fragment-duration 4000 --index flac-fragmented-mp4-11.mp4
```

ссылка: https://strm-test.msermakov.music.dev.yandex.ru/flac-samples/11/flac-fragmented-mp4-11.mp4

платформы:
1. веб +
2. ios -
3. android +
