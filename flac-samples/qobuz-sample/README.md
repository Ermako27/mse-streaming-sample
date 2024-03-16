Трек в кодеке flac и контейнере fmp4. В папке `segments` лежат сегменты из fmp4 контейнера в виде отдельных файлов. Каждый сегмент зашифрован aes-128-ctr

Данные из quboz, которые использовались для формирования ссылок на отдельные файлы сегменты и ключи для расшифровки
```json
{
    "file_type": "full",
    "track_id": 236521551,
    "format_id": 6,
    "audio_file_id": 208417472,
    "sampling_rate": 44100,
    "bits_depth": 16,
    "n_channels": 2,
    "duration": 136.09990929705216,
    "n_samples": 6002006,
    "mime_type": "audio/mp4; codecs=\"flac\"",
    "url_template": "https://streaming-qobuz-sec.akamaized.net/file?uid=2971018&eid=236521551&fmt=6&fid=208417472&profile=sec-1&s=$SEGMENT$&app_id=950096963&cid=2105596&etsp=1710624428&hmac=eqZl7-8RdGW5sm4EWNYjhevc-yU",
    "n_segments": 14,
    "key_id": "a54279f6-140f-dc50-51ad-c3ed66d8e5b2",
    "key": "qbz-1.95TLYuAwVwDWZFZfsyRI-NmFZzoryD0C41Rcqo3XN8Q.62IBkF0J3FO9FhqlssDrfg",
    "blob": "000000236521551"
}
```
### Расшифровка
ключ состоит из 3-х частей
1. `qbz-1`
2. `95TLYuAwVwDWZFZfsyRI-NmFZzoryD0C41Rcqo3XN8Q` base64
3. `62IBkF0J3FO9FhqlssDrfg` base64

Чтобы получить ключ для расшифровки нужно:
**Шаг 1**
Сделать Uint из 2 и 3 частей ключа. Для это нужно сделать textToRaw(decodeBase64Url(...))
```js
function unescape(e) {
  return (e + "===".slice((e.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/")
}

decodeBase64Url = function(e) {
    return atob(unescape(e))
}

textToRaw = function(e) {
    return Uint8Array.from(Array.from(e).map((function(e) {
        return e.charCodeAt(0)
    })))
}
```
**Шаг 2. Разворачивание ключа.** Вторая часть `95TLYuAwVwDWZFZfsyRI-NmFZzoryD0C41Rcqo3XN8Q` это зашифрованный ключ для дальнейшей расшифровки музыкальных файлов.
Чтобы расшифровать ключ, нужно воспользоваться третьей частью `62IBkF0J3FO9FhqlssDrfg`.
```js
/**
 * r - Uint32 из второй части включа, то есть из `95TLYuAwVwDWZFZfsyRI-NmFZzoryD0C41Rcqo3XN8Q`
 * n - Uint16 из третьей части ключа, то есть из `62IBkF0J3FO9FhqlssDrfg`
 */
crypto.subtle.unwrapKey("raw", r, e._sessionKey, {
  name: "AES-CBC",
  iv: n
}, {
  name: "AES-CTR"
}, !1, ["decrypt"]);
```
**Шаг 3. Создание sessionKey.**
При создании используются данные из ответа на запрос https://www.qobuz.com/api.json/0.2/session/start
```json
{
  "session_id": "dRj_t8WrcdBuJBAmeahMJw",
  "profile": "qbz-1",
  "infos": "rMttuVpW9Y6rIJN3dEvxAA.bm9uZQ",
  "expires_at": 1710574239
}
```
Процесс создания sessionKey начинается в функции `sessionStart`, само создание происходит в `S(r.infos);`.
В `S(r.infos);` выполняются следующие шаги:

```js
d.initialization = function() {
  var e = window.__ENVIRONMENT__; // production
  return "recette" === e ? d.initialSeed("MTBiMjUxYzI4NmNmYmY2NGQ2YjcxMD", window.utimezone.london) : "integration" === e ? d.initialSeed("MmFiNzEzMWQzODM2MjNjZjQwM2NmM2", window.utimezone.algier) : d.initialSeed("OTc5NTQ5NDM3ZmNjNGEzZmFhZDQ4Nj", window.utimezone.berlin)
}

d.initialSeed = function(e, t) {
  // e = OTc5NTQ5NDM3ZmNjNGEzZmFhZDQ4Nj
  // t = window.utimezone.berlin = 53
  return window.randomize.initialSeed(e, t)
}

// это и есть window.randomize.initialSeed
t.initialSeed = function(e, t) {
  /**
   * e = OTc5NTQ5NDM3ZmNjNGEzZmFhZDQ4Nj
   * t = 53
   */
  return function(e, t, r) {
    /**
     * e = OTc5NTQ5NDM3ZmNjNGEzZmFhZDQ4Nj
     * t = a.default.timezones[53].info = diNWNkMjVkY2I=MWNlNTlmYjA5ZDQ2
     * r = a.default.timezones[t].extras = NGM4NGJlNmE4YzU4YTQyMDA0OTU=
     */
    return atob((e + t + r).substr(0, (e + t + r).length - 44))
  }(e, a.default.timezones[t].info, a.default.timezones[t].extras) || (new Date).getTime()
}
/////////////////////

const r = 'rMttuVpW9Y6rIJN3dEvxAA.bm9uZQ'.split('.')
const n = textToRaw(decodeBase64Url(r[0]))
const a = textToRaw(decodeBase64Url(r[1]))
const o = window.rng.prototype.initialization()
const s = Uint8Array.from(o.match(/[\s\S]{1,2}/g).map((function(e) {
  return parseInt(e, 16)
})))
const deriveKey = window.crypto.subtle.importKey("raw", s, {name: "HKDF"}, !1, ["deriveKey", "deriveBits"]);
const sessionKey = window.crypto.subtle.deriveKey({
  name: "HKDF",
  hash: "SHA-256",
  salt: n,
  info: a
}, deriveKey, {
  name: "AES-CBC",
  length: 128
}, !1, ["unwrapKey"]);
```

authToken = 5wcFeGlmGOX6gNubYccQw0sV9p9TVTHLvmHgOVb_IPXPrE5FAc6VHFd6Jeqo7LpYTkuqsIpn2Co1GePVZ_egVQ

