// ============================================================
//  kart.js  -  Canvas Kart Uretici  v2
//  Developed by RevanDev ZAD
//
//  Oyuncu fotografi:
//    - Lokal dosya:  "./images/messi.png"
//    - URL:          "https://example.com/messi.png"
//    - null:         silhouette gosterir
//
//  Takim logosu:
//    - "./logos/barcelona.png" gibi lokal dosya
//    - ya da null (sadece takim adi yazilir)
// ============================================================

const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fs   = require("fs");
const path = require("path");
const https = require("https");
const http  = require("http");

// ── Rarity temaları ───────────────────────────────────────
const TEMA = {
    bronz:  { bg1:"#2a1200", bg2:"#0d0600", border:"#cd7f32", glow:"#b05a10", accent:"#f4c07a", badge:"#5a2a00", teamBg:"#3a1a00" },
    gumus:  { bg1:"#1c1c2e", bg2:"#0a0a18", border:"#c0c0c0", glow:"#909090", accent:"#e8e8e8", badge:"#303050", teamBg:"#202040" },
    altin:  { bg1:"#1f1800", bg2:"#0a0800", border:"#ffd700", glow:"#ffaa00", accent:"#fff3a0", badge:"#4a3a00", teamBg:"#302800" },
    elmas:  { bg1:"#001828", bg2:"#000810", border:"#00cfff", glow:"#0099cc", accent:"#a0eeff", badge:"#003050", teamBg:"#002040" },
    efsane: { bg1:"#180028", bg2:"#080010", border:"#cc44ff", glow:"#9900cc", accent:"#eeb0ff", badge:"#300055", teamBg:"#200040" },
};

const MEVKI_TR   = { GK:"KALECI", DEF:"DEFANS", MID:"ORTA SAHA", ATT:"FORVET" };
const STAT_ADLAR = ["HIZ", "SUT", "PAS", "DEF", "FIZIK", "DRIBBLING"];

// ── Yardimcilar ───────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// URL'den buffer yukle
function fetchBuffer(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith("https") ? https : http;
        mod.get(url, res => {
            const chunks = [];
            res.on("data", c => chunks.push(c));
            res.on("end",  () => resolve(Buffer.concat(chunks)));
            res.on("error", reject);
        }).on("error", reject);
    });
}

// image alani string ise yukle, null ise null donus
async function loadPlayerImage(imagePath) {
    if (!imagePath) return null;
    try {
        if (imagePath.startsWith("http")) {
            const buf = await fetchBuffer(imagePath);
            return await loadImage(buf);
        } else {
            const fullPath = path.resolve(imagePath);
            if (!fs.existsSync(fullPath)) return null;
            return await loadImage(fullPath);
        }
    } catch (_) {
        return null;
    }
}

// Silhouette (foto yoksa)
function drawSilhouette(ctx, cx, cy, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx, cy - 54, 25, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - 7, cy - 30, 14, 12);
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy + 58);
    ctx.bezierCurveTo(cx - 40, cy + 18, cx - 30, cy - 14, cx - 10, cy - 18);
    ctx.lineTo(cx + 10, cy - 18);
    ctx.bezierCurveTo(cx + 30, cy - 14, cx + 40, cy + 18, cx + 36, cy + 58);
    ctx.closePath(); ctx.fill();
    // kollar
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy - 16);
    ctx.bezierCurveTo(cx - 52, cy - 8, cx - 58, cy + 18, cx - 46, cy + 38);
    ctx.bezierCurveTo(cx - 40, cy + 48, cx - 33, cy + 42, cx - 30, cy + 34);
    ctx.bezierCurveTo(cx - 38, cy + 20, cx - 34, cy + 2, cx - 18, cy - 4);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 28, cy - 16);
    ctx.bezierCurveTo(cx + 52, cy - 8, cx + 58, cy + 18, cx + 46, cy + 38);
    ctx.bezierCurveTo(cx + 40, cy + 48, cx + 33, cy + 42, cx + 30, cy + 34);
    ctx.bezierCurveTo(cx + 38, cy + 20, cx + 34, cy + 2, cx + 18, cy - 4);
    ctx.closePath(); ctx.fill();
    // bacaklar
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy + 56);
    ctx.bezierCurveTo(cx - 36, cy + 78, cx - 34, cy + 98, cx - 28, cy + 108);
    ctx.lineTo(cx - 10, cy + 108); ctx.bezierCurveTo(cx - 8, cy + 98, cx - 12, cy + 78, cx - 8, cy + 56);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 32, cy + 56);
    ctx.bezierCurveTo(cx + 36, cy + 78, cx + 34, cy + 98, cx + 28, cy + 108);
    ctx.lineTo(cx + 10, cy + 108); ctx.bezierCurveTo(cx + 8, cy + 98, ctx + 12, cy + 78, cx + 8, cy + 56);
    ctx.closePath(); ctx.fill();
    ctx.restore();
}

// ── OYUNCU KARTI ──────────────────────────────────────────
async function generatePlayerCard(player, stats) {
    const W = 420, H = 640;
    const canvas = createCanvas(W, H);
    const ctx    = canvas.getContext("2d");
    const T      = TEMA[player.rarity] || TEMA.bronz;

    // Arkaplan
    const bgGr = ctx.createLinearGradient(0, 0, W, H);
    bgGr.addColorStop(0, T.bg1);
    bgGr.addColorStop(1, T.bg2);
    ctx.fillStyle = bgGr;
    ctx.fillRect(0, 0, W, H);

    // Parlama
    const shine = ctx.createRadialGradient(W * 0.35, H * 0.22, 20, W * 0.35, H * 0.22, W * 0.75);
    shine.addColorStop(0, T.glow + "28");
    shine.addColorStop(1, "transparent");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, W, H);

    // Grain
    for (let k = 0; k < 800; k++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.032})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }

    // Dis cerceve glow
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur  = 32;
    ctx.strokeStyle = T.border;
    ctx.lineWidth   = 2.5;
    roundRect(ctx, 10, 10, W - 20, H - 20, 20);
    ctx.stroke();
    ctx.restore();

    // Ic cerceve
    ctx.strokeStyle = T.border + "25";
    ctx.lineWidth   = 1;
    roundRect(ctx, 20, 20, W - 40, H - 40, 14);
    ctx.stroke();

    // ── Rating badge (sol ust) ────────────────────────────
    ctx.save();
    ctx.fillStyle = T.badge + "cc";
    roundRect(ctx, 28, 28, 80, 90, 12);
    ctx.fill();
    ctx.strokeStyle = T.border + "55";
    ctx.lineWidth   = 1;
    roundRect(ctx, 28, 28, 80, 90, 12);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur  = 18;
    ctx.font        = "bold 44px sans-serif";
    ctx.fillStyle   = T.accent;
    ctx.textAlign   = "center";
    ctx.fillText(String(player.rating), 68, 80);
    ctx.restore();

    ctx.font      = "bold 11px sans-serif";
    ctx.fillStyle = T.border;
    ctx.textAlign = "center";
    ctx.fillText(MEVKI_TR[player.pos] || player.pos, 68, 100);

    // ── Rarity rozeti (sag ust) ───────────────────────────
    ctx.save();
    ctx.fillStyle = T.badge + "cc";
    roundRect(ctx, W - 114, 28, 86, 28, 8);
    ctx.fill();
    ctx.strokeStyle = T.border + "55";
    ctx.lineWidth   = 1;
    roundRect(ctx, W - 114, 28, 86, 28, 8);
    ctx.stroke();
    ctx.font      = "bold 12px sans-serif";
    ctx.fillStyle = T.accent;
    ctx.textAlign = "center";
    ctx.fillText(player.rarity.toUpperCase(), W - 71, 47);
    ctx.restore();

    // ── Oyuncu foto veya silhouette ───────────────────────
    const aCX = W / 2, aCY = 220;
    const R   = 105;

    // Daire parlama
    const circGr = ctx.createRadialGradient(aCX, aCY, 20, aCX, aCY, R + 10);
    circGr.addColorStop(0, T.glow + "44");
    circGr.addColorStop(0.7, T.glow + "11");
    circGr.addColorStop(1, "transparent");
    ctx.fillStyle = circGr;
    ctx.beginPath();
    ctx.arc(aCX, aCY, R + 10, 0, Math.PI * 2);
    ctx.fill();

    // Daire cerceve
    ctx.save();
    ctx.shadowColor = T.glow;
    ctx.shadowBlur  = 20;
    ctx.strokeStyle = T.border + "aa";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(aCX, aCY, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Foto veya silhouette
    ctx.save();
    ctx.beginPath();
    ctx.arc(aCX, aCY, R - 2, 0, Math.PI * 2);
    ctx.clip();

    const playerImg = await loadPlayerImage(player.image);
    if (playerImg) {
        // Fotografi daireye sigdir (cover mantigi)
        const iw = playerImg.width, ih = playerImg.height;
        const diam = (R - 2) * 2;
        const scale = Math.max(diam / iw, diam / ih);
        const sw = iw * scale, sh = ih * scale;
        const sx = aCX - sw / 2, sy = aCY - sh / 2;
        ctx.drawImage(playerImg, sx, sy, sw, sh);

        // Alt kisim icin hafif vignette - isim okunabilir olsun
        const vign = ctx.createLinearGradient(0, aCY, 0, aCY + R);
        vign.addColorStop(0, "transparent");
        vign.addColorStop(1, T.bg2 + "cc");
        ctx.fillStyle = vign;
        ctx.fillRect(aCX - R, aCY, R * 2, R);
    } else {
        // Arkaplan rengi
        ctx.fillStyle = T.badge + "88";
        ctx.fillRect(aCX - R, aCY - R, R * 2, R * 2);
        drawSilhouette(ctx, aCX, aCY + 10, T.border + "cc");
    }
    ctx.restore();

    // ── Oyuncu adi ────────────────────────────────────────
    const nl = player.name.length;
    const fs = nl > 20 ? 17 : nl > 15 ? 21 : nl > 10 ? 25 : 28;
    ctx.save();
    ctx.font        = `bold ${fs}px sans-serif`;
    ctx.fillStyle   = "#ffffff";
    ctx.textAlign   = "center";
    ctx.shadowColor = T.glow;
    ctx.shadowBlur  = 10;
    ctx.fillText(player.name, W / 2, 347);
    ctx.restore();

    // ── Takim bilgisi ─────────────────────────────────────
    if (player.team) {
        // Takim arka plani
        const teamW = Math.min(200, player.team.length * 10 + 40);
        ctx.save();
        ctx.fillStyle = T.teamBg + "cc";
        roundRect(ctx, W / 2 - teamW / 2, 354, teamW, 22, 6);
        ctx.fill();
        ctx.strokeStyle = T.border + "44";
        ctx.lineWidth   = 1;
        roundRect(ctx, W / 2 - teamW / 2, 354, teamW, 22, 6);
        ctx.stroke();
        ctx.restore();

        ctx.font      = "bold 11px sans-serif";
        ctx.fillStyle = T.accent + "cc";
        ctx.textAlign = "center";
        ctx.fillText(player.team, W / 2, 370);
    }

    // ── Ayrac ─────────────────────────────────────────────
    const lineY = 386;
    const lineGr = ctx.createLinearGradient(38, 0, W - 38, 0);
    lineGr.addColorStop(0,   "transparent");
    lineGr.addColorStop(0.2, T.border + "66");
    lineGr.addColorStop(0.5, T.border);
    lineGr.addColorStop(0.8, T.border + "66");
    lineGr.addColorStop(1,   "transparent");
    ctx.strokeStyle = lineGr;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(38, lineY);
    ctx.lineTo(W - 38, lineY);
    ctx.stroke();

    // ── Stat barlar ───────────────────────────────────────
    const statVals = [stats.hiz, stats.sut, stats.pas, stats.def, stats.fizik, stats.dribbling];
    const colL = 38, colR = W / 2 + 8;
    const barW = W / 2 - 55;
    const rowH = 36;
    const sy   = 402;

    statVals.forEach((val, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x   = col === 0 ? colL : colR;
        const y   = sy + row * rowH;

        ctx.font      = "bold 10px sans-serif";
        ctx.fillStyle = T.accent + "aa";
        ctx.textAlign = "left";
        ctx.fillText(STAT_ADLAR[idx], x, y);

        ctx.font      = "bold 12px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        ctx.fillText(String(val), x + barW, y);

        ctx.fillStyle = "rgba(255,255,255,0.07)";
        roundRect(ctx, x, y + 4, barW, 7, 3);
        ctx.fill();

        const fw  = Math.max(4, Math.round((val / 99) * barW));
        const bGr = ctx.createLinearGradient(x, 0, x + barW, 0);
        bGr.addColorStop(0, T.glow + "cc");
        bGr.addColorStop(1, T.border);
        ctx.fillStyle = bGr;
        roundRect(ctx, x, y + 4, fw, 7, 3);
        ctx.fill();
    });

    // ── Alt imza ─────────────────────────────────────────
    ctx.font      = "10px sans-serif";
    ctx.fillStyle = T.border + "44";
    ctx.textAlign = "center";
    ctx.fillText("Developed by RevanDev ZAD", W / 2, H - 14);

    return canvas.toBuffer("image/png");
}

// ── MAC SONUC KARTI ───────────────────────────────────────
function generateMatchCard(cName, tName, cGoals, tGoals, cStr, tStr) {
    const W = 520, H = 290;
    const canvas = createCanvas(W, H);
    const ctx    = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0d1117");
    bg.addColorStop(1, "#161b22");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (let k = 0; k < 600; k++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.028})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }

    ctx.save();
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur  = 22;
    ctx.strokeStyle = "#ffd70055";
    ctx.lineWidth   = 2;
    roundRect(ctx, 8, 8, W - 16, H - 16, 16);
    ctx.stroke();
    ctx.restore();

    ctx.font      = "bold 13px sans-serif";
    ctx.fillStyle = "#ffd700aa";
    ctx.textAlign = "center";
    ctx.fillText("MAC SONUCU", W / 2, 36);

    ctx.save();
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur  = 24;
    ctx.font        = "bold 68px sans-serif";
    ctx.fillStyle   = "#ffffff";
    ctx.textAlign   = "center";
    ctx.fillText(`${cGoals}  -  ${tGoals}`, W / 2, 126);
    ctx.restore();

    ctx.font      = "bold 18px sans-serif";
    ctx.fillStyle = cGoals >= tGoals ? "#ffd700" : "#999999";
    ctx.textAlign = "left";
    ctx.fillText(cName, 38, 162);

    ctx.fillStyle = tGoals >= cGoals ? "#ffd700" : "#999999";
    ctx.textAlign = "right";
    ctx.fillText(tName, W - 38, 162);

    const total = (cStr + tStr) || 1;
    const cBW   = Math.round((cStr / total) * (W - 76));
    const tBW   = (W - 76) - cBW;

    ctx.fillStyle = "#ffffff10";
    ctx.fillRect(38, 178, W - 76, 10);

    const cGr = ctx.createLinearGradient(38, 0, 38 + cBW, 0);
    cGr.addColorStop(0, "#ffd700"); cGr.addColorStop(1, "#ffaa00");
    ctx.fillStyle = cGr;
    ctx.fillRect(38, 178, cBW, 10);

    const tGr = ctx.createLinearGradient(W - 38 - tBW, 0, W - 38, 0);
    tGr.addColorStop(0, "#0099ff"); tGr.addColorStop(1, "#00cfff");
    ctx.fillStyle = tGr;
    ctx.fillRect(38 + cBW, 178, tBW, 10);

    ctx.font      = "11px sans-serif";
    ctx.fillStyle = "#ffffff66";
    ctx.textAlign = "left";
    ctx.fillText(`Guc: ${cStr}`, 38, 204);
    ctx.textAlign = "right";
    ctx.fillText(`Guc: ${tStr}`, W - 38, 204);

    const sonuc = cGoals > tGoals ? `${cName} kazandi!`
                : tGoals > cGoals ? `${tName} kazandi!`
                : "Berabere!";

    ctx.font      = "bold 15px sans-serif";
    ctx.fillStyle = "#ffd700";
    ctx.textAlign = "center";
    ctx.fillText(sonuc, W / 2, 234);

    ctx.font      = "10px sans-serif";
    ctx.fillStyle = "#ffffff18";
    ctx.fillText("Developed by RevanDev ZAD", W / 2, H - 12);

    return canvas.toBuffer("image/png");
}

module.exports = { generatePlayerCard, generateMatchCard };
