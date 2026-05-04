# Rywen FC Bot v11.0
**Developed by RevanDev ZAD**

## Kurulum

```bash
npm install
```

Canvas icin (oyuncu karti gorselleri):
```bash
npm install @napi-rs/canvas
```

## Baslat

```bash
# .env.example dosyasini .env olarak kopyala ve tokenini yaz
cp .env.example .env

node index.js
```

## Klasor Yapisi

```
rywen-fc/
├── index.js          # Ana bot
├── oyuncu.js         # Oyuncu veritabani
├── kart.js           # Canvas kart uretici
├── package.json
├── .env.example
├── images/           # Oyuncu fotolari buraya
│   └── messi.png     # ornek: ./images/messi.png
├── logos/            # Takim logolari (opsiyonel)
├── data.json         # Kullanici verileri (otomatik olusur)
└── oyuncu_ekstra.json # Admin eklenen oyuncular (otomatik olusur)
```

## Oyuncu Fotografi Ekleme

`oyuncu.js` dosyasinda `image` alanini doldur:

```js
{
  name: "Lionel Messi",
  pos: "ATT",
  rating: 95,
  rarity: "efsane",
  team: "Inter Miami",
  image: "./images/messi.png"   // lokal dosya
  // image: "https://..."       // URL de olur
  // image: null                // silhouette goster
}
```

## Admin Ayari

`index.js` icinde `ADMIN_IDS` dizisine Discord ID'ni ekle:
```js
const ADMIN_IDS = ["123456789012345678"];
```

## Komutlar

| Komut | Aciklama |
|-------|----------|
| `!pack` | Baslangic kadrosu al (bir kez) |
| `!kadro` | Kadronu goster |
| `!shop` | Transfer merkezi |
| `!sat` | Oyuncu sat |
| `!degistir` | Kadrodaki oyuncuyu degistir |
| `!claim` | Her 5 saatte ucretsiz oyuncu |
| `!mac @kullanici` | Mac daveti gonder |
| `!bakiye` | Bakiyeni gor |
| `!kart @kullanici [sira]` | Oyuncu karti goster |
| `!bilgi [oyuncu adi]` | Oyuncu detaylari |
| `!oyuncuekle` | *(Admin)* Yeni oyuncu ekle |
| `!oyuncusil [ad]` | *(Admin)* Custom oyuncuyu sil |
| `!oyunculiste` | *(Admin)* Custom oyunculari listele |
