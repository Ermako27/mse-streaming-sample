## Как работает Qobuz
### Загрузка
Загружает файлы с mime-type: `audio/mp4; codecs="flac"`, то есть кодек flac в контейнере fmp4.

В рамках одного трека, клиент делает несколько запросов по ссылкам, которые соответствуют шаблону
```
https://streaming-qobuz-sec.akamaized.net/file?uid=2971018&eid=236521551&fmt=6&fid=208417472&profile=sec-1&s=$SEGMENT$&app_id=950096963&cid=2105596&etsp=1710736373&hmac=SHRUzTiVCIgMrGkaZzDeWXq2qFc
```
Вместо параметра `$SEGMENT$` подставляется номер сегмента из fmp4 файла с треком. На бекенде возможны 2 варианта реализации:
1. один fmp4 файл поделен физически на несколько файлов сегментов, каждая ссылка ведет к своему файлу
2. на бекенде лежит один fmp4 файл, бекенд, получив запрос с номером сегмента, сам вырезает из файла нужный byte-range и отдает его клиенту

### Структура сегментов
Сегмент №0 – незашифрованный сегмент, в нем хранится вся информация о треке. Из mp4dump видно, что в сегменте есть заголовок
```
[C7C75DF0FDD9-51E9-8FC2-2971-E4ACF8D2] size=24+457
```
Конкретно из этого заголовка браузер парсит такую структуру
```json
{
    "boxType": "QBZ_INIT_DATA_BOX",
    "start": 24,
    "size": 481,
    "type": "uuid",
    "uuid": "c7c75df0fdd951e98fc22971e4acf8d2",
    "initial_data_raw": {
        "type": "Buffer",
        "data": [
          // UInt8Array 
        ]
    },
    "track_id": 236521551,
    "file_id": 208417472,
    "sample_rate": 44100,
    "bits_per_sample": 16,
    "channels_count": 2,
    "samples_count": 6002006,
    "key_id": "a54279f6140fdc5051adc3ed66d8e5b2",
    "segments": [
        {
            "length": 596760,
            "samples_count": 442368,
            "start_time": 0,
            "duration": 10.031020408163265
        },
        {
            "length": 688527,
            "samples_count": 442368,
            "start_time": 10.031020408163265,
            "duration": 10.031020408163265
        },
        {
            "length": 750915,
            "samples_count": 442368,
            "start_time": 20.06204081632653,
            "duration": 10.031020408163265
        },
        {
            "length": 750323,
            "samples_count": 442368,
            "start_time": 30.093061224489794,
            "duration": 10.031020408163265
        },
        {
            "length": 678885,
            "samples_count": 442368,
            "start_time": 40.12408163265306,
            "duration": 10.031020408163265
        },
        {
            "length": 784528,
            "samples_count": 442368,
            "start_time": 50.155102040816324,
            "duration": 10.031020408163265
        },
        {
            "length": 896156,
            "samples_count": 442368,
            "start_time": 60.18612244897959,
            "duration": 10.031020408163265
        },
        {
            "length": 868341,
            "samples_count": 442368,
            "start_time": 70.21714285714285,
            "duration": 10.031020408163265
        },
        {
            "length": 891711,
            "samples_count": 442368,
            "start_time": 80.24816326530612,
            "duration": 10.031020408163265
        },
        {
            "length": 1093550,
            "samples_count": 442368,
            "start_time": 90.27918367346939,
            "duration": 10.031020408163265
        },
        {
            "length": 1163104,
            "samples_count": 442368,
            "start_time": 100.31020408163266,
            "duration": 10.031020408163265
        },
        {
            "length": 1158596,
            "samples_count": 442368,
            "start_time": 110.34122448979593,
            "duration": 10.031020408163265
        },
        {
            "length": 1141072,
            "samples_count": 442368,
            "start_time": 120.3722448979592,
            "duration": 10.031020408163265
        },
        {
            "length": 205611,
            "samples_count": 251222,
            "start_time": 130.40326530612248,
            "duration": 5.696643990929705
        }
    ]
}
```
Все остальные сегменты после №0 частично зашифрованы с помощью aes-128-ctr. Частично означает, что в них не зашифрован заголовок `[styp]`,
к тому же, судя по коду, зашифрованы еще и не все фреймы сегмента. Код расшифровки можно увидеть в файлах `script.js` и `decrypt.js`.
Каждый сегмент после сегмента №0 также содержит похожий заголовок
```
[3B42129256F3-5F75-9236-63B6-9A1F52B2] size=24+1548
```
Из этого заголовка браузер парсит такую структуру
```json
{
    "boxType": "QBZ_SEGMENT_DATA_BOX",
    "start": 24,
    "size": 1572,
    "type": "uuid",
    "uuid": "3b42129256f35f75923663b69a1f52b2",
    "frames": [
        {
            "length": 1583,
            "flags": 1,
            "startOfFrame": 2080
        },
        {
            "length": 4995,
            "flags": 0,
            "startOfFrame": 3663
        },
        {
            "length": 4968,
            "flags": 1,
            "startOfFrame": 8658
        },
        {
            "length": 4965,
            "flags": 0,
            "startOfFrame": 13626
        },
        {
            "length": 4904,
            "flags": 1,
            "startOfFrame": 18591
        },
        {
            "length": 4905,
            "flags": 0,
            "startOfFrame": 23495
        }
      // множество других фреймов
    ]
}
```
На примере скачанного файла фреймы с `"flags": 0` не зашифрованы.
### Длительность и перемотка
Длительность берется из сегмента №0. Перемотка реализуется с помощью `segments`, пользователь нажимает на определенное время, по нему определяем
№ нужного сегмента и загружаем его по шаблонной ссылке, куда вместо `$SEGMENT$` подставляем № сегмента.