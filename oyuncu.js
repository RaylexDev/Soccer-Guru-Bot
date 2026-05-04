// ============================================================
//  oyuncu.js  -  Rywen FC  |  Developed by RevanDev ZAD
//
//  Her oyuncuya  team  ve  image  alani eklendi.
//  image: "./images/oyuncuadi.png"  seklinde lokal dosya yolu
//         ya da "https://..."       seklinde URL verebilirsin.
//         null birakirsan silhouette gosteriyor.
// ============================================================

const PLAYERS = [

    // ─────────────────────────────────────────────────────────
    //  KALECILER
    // ─────────────────────────────────────────────────────────
    {
        name: "Ahmet Senturk", pos: "GK", rating: 50, rarity: "bronz",
        team: "Amatör FC",     image: null
    },
    {
        name: "Murat Demir",   pos: "GK", rating: 53, rarity: "bronz",
        team: "Yildirim SK",   image: null
    },
    {
        name: "Selim Ozturk",  pos: "GK", rating: 56, rarity: "bronz",
        team: "Kartal Spor",   image: null
    },
    {
        name: "Burak Aksoy",   pos: "GK", rating: 58, rarity: "bronz",
        team: "Deniz FK",      image: null
    },
    {
        name: "Emre Yilmaz",   pos: "GK", rating: 61, rarity: "gumus",
        team: "Altay",         image: null
    },
    {
        name: "Serkan Celik",  pos: "GK", rating: 64, rarity: "gumus",
        team: "Konyaspor",     image: null
    },
    {
        name: "Tayfun Sahin",  pos: "GK", rating: 67, rarity: "gumus",
        team: "Sivasspor",     image: null
    },
    {
        name: "Ozan Yildirim", pos: "GK", rating: 69, rarity: "gumus",
        team: "Kayserispor",   image: null
    },
    {
        name: "Volkan Demirel",    pos: "GK", rating: 73, rarity: "altin",
        team: "Fenerbahce",        image: null
    },
    {
        name: "Fernando Muslera",  pos: "GK", rating: 76, rarity: "altin",
        team: "Galatasaray",       image: null
    },
    {
        name: "Altay Bayindir",    pos: "GK", rating: 79, rarity: "altin",
        team: "Manchester United", image: null
    },
    {
        name: "Ugurcan Cakir",     pos: "GK", rating: 82, rarity: "elmas",
        team: "Trabzonspor",       image: null
    },
    {
        name: "Mert Gunok",        pos: "GK", rating: 85, rarity: "elmas",
        team: "Besiktas",          image: null
    },
    {
        name: "Thibaut Courtois",  pos: "GK", rating: 91, rarity: "efsane",
        team: "Real Madrid",       image: null
    },
    {
        name: "Alisson Becker",    pos: "GK", rating: 90, rarity: "efsane",
        team: "Liverpool",         image: null
    },
    {
        name: "Manuel Neuer",      pos: "GK", rating: 88, rarity: "efsane",
        team: "Bayern Munich",     image: null
    },
    {
        name: "Ederson",           pos: "GK", rating: 89, rarity: "efsane",
        team: "Manchester City",   image: null
    },
    {
        name: "Jan Oblak",         pos: "GK", rating: 91, rarity: "efsane",
        team: "Atletico Madrid",   image: null
    },
    {
        name: "Gianluigi Donnarumma", pos: "GK", rating: 90, rarity: "efsane",
        team: "PSG",                   image: null
    },
    {
        name: "Marc-Andre ter Stegen", pos: "GK", rating: 88, rarity: "efsane",
        team: "Barcelona",             image: null
    },

    // ─────────────────────────────────────────────────────────
    //  DEFANSLAR
    // ─────────────────────────────────────────────────────────
    {
        name: "Ali Veli",             pos: "DEF", rating: 50, rarity: "bronz",
        team: "Amatör FC",            image: null
    },
    {
        name: "Kemal Arslan",         pos: "DEF", rating: 53, rarity: "bronz",
        team: "Yildirim SK",          image: null
    },
    {
        name: "Tuncay Ates",          pos: "DEF", rating: 56, rarity: "bronz",
        team: "Kartal Spor",          image: null
    },
    {
        name: "Resul Ozkan",          pos: "DEF", rating: 58, rarity: "bronz",
        team: "Deniz FK",             image: null
    },
    {
        name: "Caner Erkin",          pos: "DEF", rating: 61, rarity: "gumus",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Hasan Ali Kaldirim",   pos: "DEF", rating: 64, rarity: "gumus",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Sener Ozbayrakli",     pos: "DEF", rating: 67, rarity: "gumus",
        team: "Besiktas",             image: null
    },
    {
        name: "Gokhan Gonul",         pos: "DEF", rating: 69, rarity: "gumus",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Umut Meras",           pos: "DEF", rating: 72, rarity: "altin",
        team: "St. Etienne",          image: null
    },
    {
        name: "Merih Demiral",        pos: "DEF", rating: 75, rarity: "altin",
        team: "Al-Qadsiah",           image: null
    },
    {
        name: "Abdulkerim Bardakci",  pos: "DEF", rating: 77, rarity: "altin",
        team: "Galatasaray",          image: null
    },
    {
        name: "Samet Akaydin",        pos: "DEF", rating: 79, rarity: "altin",
        team: "Sevilla",              image: null
    },
    {
        name: "Zeki Celik",           pos: "DEF", rating: 82, rarity: "elmas",
        team: "Roma",                 image: null
    },
    {
        name: "Ferdi Kadioglu",       pos: "DEF", rating: 85, rarity: "elmas",
        team: "Brighton",             image: null
    },
    {
        name: "Virgil van Dijk",      pos: "DEF", rating: 92, rarity: "efsane",
        team: "Liverpool",            image: null
    },
    {
        name: "Ruben Dias",           pos: "DEF", rating: 90, rarity: "efsane",
        team: "Manchester City",      image: null
    },
    {
        name: "Trent Alexander-Arnold", pos: "DEF", rating: 88, rarity: "efsane",
        team: "Real Madrid",            image: null
    },
    {
        name: "Antonio Rudiger",      pos: "DEF", rating: 86, rarity: "efsane",
        team: "Real Madrid",          image: null
    },
    {
        name: "William Saliba",       pos: "DEF", rating: 87, rarity: "efsane",
        team: "Arsenal",              image: null
    },
    {
        name: "Achraf Hakimi",        pos: "DEF", rating: 87, rarity: "efsane",
        team: "PSG",                  image: null
    },
    {
        name: "Theo Hernandez",       pos: "DEF", rating: 86, rarity: "efsane",
        team: "AC Milan",             image: null
    },
    {
        name: "Josko Gvardiol",       pos: "DEF", rating: 85, rarity: "elmas",
        team: "Manchester City",      image: null
    },
    {
        name: "Jules Kounde",         pos: "DEF", rating: 84, rarity: "elmas",
        team: "Barcelona",            image: null
    },
    {
        name: "Alessandro Bastoni",   pos: "DEF", rating: 86, rarity: "efsane",
        team: "Inter Milan",          image: null
    },
    {
        name: "Dayot Upamecano",      pos: "DEF", rating: 84, rarity: "elmas",
        team: "Bayern Munich",        image: null
    },

    // ─────────────────────────────────────────────────────────
    //  ORTA SAHALAR
    // ─────────────────────────────────────────────────────────
    {
        name: "Fatih Kurt",           pos: "MID", rating: 50, rarity: "bronz",
        team: "Amatör FC",            image: null
    },
    {
        name: "Baris Yilmaz",         pos: "MID", rating: 53, rarity: "bronz",
        team: "Yildirim SK",          image: null
    },
    {
        name: "Doruk Calis",          pos: "MID", rating: 56, rarity: "bronz",
        team: "Kartal Spor",          image: null
    },
    {
        name: "Cem Turkmen",          pos: "MID", rating: 58, rarity: "bronz",
        team: "Deniz FK",             image: null
    },
    {
        name: "Recep Nane",           pos: "MID", rating: 61, rarity: "gumus",
        team: "Altay",                image: null
    },
    {
        name: "Mehmet Topal",         pos: "MID", rating: 64, rarity: "gumus",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Selcuk Inan",          pos: "MID", rating: 67, rarity: "gumus",
        team: "Galatasaray",          image: null
    },
    {
        name: "Oguz Kagan Guctekin",  pos: "MID", rating: 69, rarity: "gumus",
        team: "Rizespor",             image: null
    },
    {
        name: "Ismail Yuksek",        pos: "MID", rating: 72, rarity: "altin",
        team: "Trabzonspor",          image: null
    },
    {
        name: "Orkun Kokcu",          pos: "MID", rating: 75, rarity: "altin",
        team: "Benfica",              image: null
    },
    {
        name: "Salih Ozcan",          pos: "MID", rating: 77, rarity: "altin",
        team: "Borussia Dortmund",    image: null
    },
    {
        name: "Okay Yokuslu",         pos: "MID", rating: 79, rarity: "altin",
        team: "West Brom",            image: null
    },
    {
        name: "Irfan Can Kahveci",    pos: "MID", rating: 81, rarity: "elmas",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Suat Serdar",          pos: "MID", rating: 83, rarity: "elmas",
        team: "Hertha Berlin",        image: null
    },
    {
        name: "Hakan Calhanoglu",     pos: "MID", rating: 86, rarity: "efsane",
        team: "Inter Milan",          image: null
    },
    {
        name: "Arda Guler",           pos: "MID", rating: 88, rarity: "efsane",
        team: "Real Madrid",          image: null
    },
    {
        name: "Kevin De Bruyne",      pos: "MID", rating: 91, rarity: "efsane",
        team: "Manchester City",      image: null
    },
    {
        name: "Luka Modric",          pos: "MID", rating: 87, rarity: "efsane",
        team: "Real Madrid",          image: null
    },
    {
        name: "Pedri",                pos: "MID", rating: 88, rarity: "efsane",
        team: "Barcelona",            image: null
    },
    {
        name: "Jude Bellingham",      pos: "MID", rating: 91, rarity: "efsane",
        team: "Real Madrid",          image: null
    },
    {
        name: "Gavi",                 pos: "MID", rating: 86, rarity: "efsane",
        team: "Barcelona",            image: null
    },
    {
        name: "Rodri",                pos: "MID", rating: 91, rarity: "efsane",
        team: "Manchester City",      image: null
    },
    {
        name: "Frenkie de Jong",      pos: "MID", rating: 86, rarity: "efsane",
        team: "Barcelona",            image: null
    },
    {
        name: "Nicolo Barella",       pos: "MID", rating: 86, rarity: "efsane",
        team: "Inter Milan",          image: null
    },
    {
        name: "Federico Valverde",    pos: "MID", rating: 87, rarity: "efsane",
        team: "Real Madrid",          image: null
    },
    {
        name: "Martin Odegaard",      pos: "MID", rating: 88, rarity: "efsane",
        team: "Arsenal",              image: null
    },
    {
        name: "Vitinha",              pos: "MID", rating: 84, rarity: "elmas",
        team: "PSG",                  image: null
    },
    {
        name: "Granit Xhaka",         pos: "MID", rating: 83, rarity: "elmas",
        team: "Bayer Leverkusen",     image: null
    },
    {
        name: "Declan Rice",          pos: "MID", rating: 87, rarity: "efsane",
        team: "Arsenal",              image: null
    },
    {
        name: "Toni Kroos",           pos: "MID", rating: 88, rarity: "efsane",
        team: "Real Madrid",          image: null
    },

    // ─────────────────────────────────────────────────────────
    //  FORVETLER
    // ─────────────────────────────────────────────────────────
    {
        name: "Emre Tas",             pos: "ATT", rating: 50, rarity: "bronz",
        team: "Amatör FC",            image: null
    },
    {
        name: "Serhat Dogan",         pos: "ATT", rating: 53, rarity: "bronz",
        team: "Yildirim SK",          image: null
    },
    {
        name: "Mert Ay",              pos: "ATT", rating: 56, rarity: "bronz",
        team: "Kartal Spor",          image: null
    },
    {
        name: "Ilhan Parlak",         pos: "ATT", rating: 58, rarity: "bronz",
        team: "Deniz FK",             image: null
    },
    {
        name: "Vedat Muriqi",         pos: "ATT", rating: 61, rarity: "gumus",
        team: "Mallorca",             image: null
    },
    {
        name: "Umut Bulut",           pos: "ATT", rating: 63, rarity: "gumus",
        team: "Galatasaray",          image: null
    },
    {
        name: "Cenk Tosun",           pos: "ATT", rating: 66, rarity: "gumus",
        team: "Besiktas",             image: null
    },
    {
        name: "Yusuf Yazici",         pos: "ATT", rating: 69, rarity: "gumus",
        team: "Lille",                image: null
    },
    {
        name: "Baris Alper Yilmaz",   pos: "ATT", rating: 72, rarity: "altin",
        team: "Galatasaray",          image: null
    },
    {
        name: "Edin Dzeko",           pos: "ATT", rating: 75, rarity: "altin",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Mostafa Mohamed",      pos: "ATT", rating: 77, rarity: "altin",
        team: "Galatasaray",          image: null
    },
    {
        name: "Cengiz Under",         pos: "ATT", rating: 80, rarity: "altin",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Burak Yilmaz",         pos: "ATT", rating: 82, rarity: "elmas",
        team: "Trabzonspor",          image: null
    },
    {
        name: "Tadic",                pos: "ATT", rating: 84, rarity: "elmas",
        team: "Fenerbahce",           image: null
    },
    {
        name: "Icardi",               pos: "ATT", rating: 86, rarity: "elmas",
        team: "Galatasaray",          image: null
    },
    {
        name: "Erling Haaland",       pos: "ATT", rating: 97, rarity: "efsane",
        team: "Manchester City",      image: null
    },
    {
        name: "Kylian Mbappe",        pos: "ATT", rating: 96, rarity: "efsane",
        team: "Real Madrid",          image: null
    },
    {
        name: "Vinicius Jr",          pos: "ATT", rating: 93, rarity: "efsane",
        team: "Real Madrid",          image: null
    },
    {
        name: "Lionel Messi",         pos: "ATT", rating: 95, rarity: "efsane",
        team: "Inter Miami",          image: null
    },
    {
        name: "Cristiano Ronaldo",    pos: "ATT", rating: 92, rarity: "efsane",
        team: "Al-Nassr",             image: null
    },
    {
        name: "Lamine Yamal",         pos: "ATT", rating: 89, rarity: "efsane",
        team: "Barcelona",            image: null
    },
    {
        name: "Raphinha",             pos: "ATT", rating: 87, rarity: "efsane",
        team: "Barcelona",            image: null
    },
    {
        name: "Marcus Rashford",      pos: "ATT", rating: 83, rarity: "elmas",
        team: "Aston Villa",          image: null
    },
    {
        name: "Bukayo Saka",          pos: "ATT", rating: 88, rarity: "efsane",
        team: "Arsenal",              image: null
    },
    {
        name: "Mohamed Salah",        pos: "ATT", rating: 92, rarity: "efsane",
        team: "Liverpool",            image: null
    },
    {
        name: "Harry Kane",           pos: "ATT", rating: 91, rarity: "efsane",
        team: "Bayern Munich",        image: null
    },
    {
        name: "Romelu Lukaku",        pos: "ATT", rating: 83, rarity: "elmas",
        team: "Napoli",               image: null
    },
    {
        name: "Antoine Griezmann",    pos: "ATT", rating: 87, rarity: "efsane",
        team: "Atletico Madrid",      image: null
    },
    {
        name: "Neymar Jr",            pos: "ATT", rating: 88, rarity: "efsane",
        team: "Al-Hilal",             image: null
    },
    {
        name: "Robert Lewandowski",   pos: "ATT", rating: 91, rarity: "efsane",
        team: "Barcelona",            image: null
    },
    {
        name: "Karim Benzema",        pos: "ATT", rating: 89, rarity: "efsane",
        team: "Al-Ittihad",           image: null
    },
    {
        name: "Son Heung-min",        pos: "ATT", rating: 87, rarity: "efsane",
        team: "Tottenham",            image: null
    },
    {
        name: "Phil Foden",           pos: "ATT", rating: 89, rarity: "efsane",
        team: "Manchester City",      image: null
    },
    {
        name: "Gabriel Martinelli",   pos: "ATT", rating: 84, rarity: "elmas",
        team: "Arsenal",              image: null
    },
    {
        name: "Rodrygo",              pos: "ATT", rating: 85, rarity: "elmas",
        team: "Real Madrid",          image: null
    },
];

// ── Fiyat ─────────────────────────────────────────────────
function getBuyPrice(rating) {
    if (rating <= 55)  return 30_000;
    if (rating <= 60)  return 80_000;
    if (rating <= 65)  return 200_000;
    if (rating <= 70)  return 450_000;
    if (rating <= 75)  return 900_000;
    if (rating <= 80)  return 2_000_000;
    if (rating <= 85)  return 5_000_000;
    if (rating <= 90)  return 12_000_000;
    if (rating <= 95)  return 30_000_000;
    return 75_000_000;
}
function getSellPrice(r) { return Math.floor(getBuyPrice(r) * 0.55); }
function fmt(n) { return n.toLocaleString("tr-TR") + " RC"; }

// ── Claim havuzu (max 80) ─────────────────────────────────
const BUCKETS = [
    { min: 50, max: 59, weight: 38 },
    { min: 60, max: 65, weight: 26 },
    { min: 66, max: 70, weight: 18 },
    { min: 71, max: 75, weight: 11 },
    { min: 76, max: 80, weight:  7 },
];
function getWeightedRandom(exclude = null) {
    const total = BUCKETS.reduce((s, b) => s + b.weight, 0);
    let roll = Math.random() * total;
    let bucket = BUCKETS[BUCKETS.length - 1];
    for (const b of BUCKETS) { roll -= b.weight; if (roll <= 0) { bucket = b; break; } }
    const pool = PLAYERS.filter(p =>
        p.rating >= bucket.min && p.rating <= bucket.max && p.name !== exclude
    );
    if (!pool.length) return PLAYERS.filter(p => p.name !== exclude)[0];
    return pool[Math.floor(Math.random() * pool.length)];
}

// ── Baslangic paketi (max 60, her mevkiden unique) ────────
function getStarterPack() {
    const pool = PLAYERS.filter(p => p.rating <= 60);
    const positions = ["GK","DEF","DEF","DEF","DEF","MID","MID","MID","ATT","ATT","ATT"];
    const used = new Set();
    return positions.map(pos => {
        const eligible = pool.filter(p => p.pos === pos && !used.has(p.name));
        if (!eligible.length) return null;
        const picked = eligible[Math.floor(Math.random() * eligible.length)];
        used.add(picked.name);
        return picked;
    }).filter(Boolean);
}

// ── Takim gucu ────────────────────────────────────────────
function calcTeamStrength(squad) {
    if (!squad.length) return 0;
    return Math.round(squad.reduce((s, p) => s + p.rating, 0) / squad.length);
}

// ── Stat uretici ─────────────────────────────────────────
function generateStats(player) {
    const b = player.rating;
    const n = () => Math.floor((Math.random() - 0.5) * 12);
    const c = v => Math.max(40, Math.min(99, v));
    const base = {
        GK:  { hiz:55,  sut:50,  pas:58,  def:90,  fizik:78, dribbling:52 },
        DEF: { hiz:74,  sut:58,  pas:65,  def:90,  fizik:82, dribbling:63 },
        MID: { hiz:78,  sut:72,  pas:88,  def:70,  fizik:72, dribbling:82 },
        ATT: { hiz:86,  sut:88,  pas:72,  def:52,  fizik:70, dribbling:88 },
    }[player.pos] || { hiz:72, sut:72, pas:72, def:72, fizik:72, dribbling:72 };
    return {
        hiz:       c(Math.round((base.hiz + b) / 2)       + n()),
        sut:       c(Math.round((base.sut + b) / 2)       + n()),
        pas:       c(Math.round((base.pas + b) / 2)       + n()),
        def:       c(Math.round((base.def + b) / 2)       + n()),
        fizik:     c(Math.round((base.fizik + b) / 2)     + n()),
        dribbling: c(Math.round((base.dribbling + b) / 2) + n()),
    };
}

module.exports = {
    PLAYERS, getBuyPrice, getSellPrice,
    fmt, getWeightedRandom, getStarterPack,
    calcTeamStrength, generateStats
};
