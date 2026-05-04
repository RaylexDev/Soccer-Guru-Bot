# ⚽ Rywen Guru Bot 
### Gelişmiş Futbol Menajer Botu

> 🧠 **Geliştirici:** RaylexDev  
> 🤖 **Konsept:** Soccer Guru tarzı gelişmiş futbol botu  
> 🎮 Kendi takımını kur, oyuncu topla, maç yap ve zirveye oyna!

---

## 🚀 Özellikler

- 🃏 Oyuncu kart sistemi (Canvas destekli)
- 📦 Pack açma & oyuncu kazanma
- 🏪 Transfer market sistemi
- ⚔️ PvP maç sistemi
- 💰 Ekonomi (bakiye, satış, kazanç)
- 🛠️ Admin oyuncu ekleme sistemi
- 🖼️ Dinamik kart görselleri

---

## 📦 Kurulum

```bash
npm install
npm install @napi-rs/canvas

## ▶️ Başlatma

cp .env.example .env
node index.js

## 📁 Klasör Yapısı

rywen-fc/
├── index.js
├── oyuncu.js
├── kart.js
├── package.json
├── .env.example
├── images/
│   └── messi.png
├── logos/
├── data.json
└── oyuncu_ekstra.json

## 🖼️ Oyuncu Fotoğrafı Ekleme

{
  name: "Lionel Messi",
  pos: "ATT",
  rating: 95,
  rarity: "efsane",
  team: "Inter Miami",
  image: "./images/messi.png"
}
