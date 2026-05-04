// ============================================================
//  index.js  -  Rywen FC Bot  v11.0
//  Developed by RevanDev ZAD
// ============================================================

const {
    Client, ActionRowBuilder, StringSelectMenuBuilder,
    ButtonBuilder, ButtonStyle, TextDisplayBuilder,
    ContainerBuilder, SeparatorBuilder,
    MessageFlags, Events, AttachmentBuilder
} = require("discord.js");
const fs   = require("fs");
const path = require("path");

const {
    PLAYERS, getBuyPrice, getSellPrice,
    fmt, getWeightedRandom, getStarterPack,
    calcTeamStrength, generateStats
} = require("./oyuncu");

// Canvas - yuklu degilse devredisi
let cardGen = null;
try {
    cardGen = require("./kart");
} catch (_) {
    console.warn("[UYARI] @napi-rs/canvas yuklu degil. Kart gorselleri kapali. Kurmak: npm install @napi-rs/canvas");
}

const client   = new Client({ intents: [131071] });
const DB_PATH  = "./data.json";
const OYUNCU_PATH = "./oyuncu_ekstra.json"; // Admin'in ekledigı custom oyuncular
let   userData = fs.existsSync(DB_PATH)
    ? JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
    : {};

// Admin ekleme custom oyuncu listesi
let customPlayers = fs.existsSync(OYUNCU_PATH)
    ? JSON.parse(fs.readFileSync(OYUNCU_PATH, "utf-8"))
    : [];

// Toplam oyuncu listesi = base + custom
function getAllPlayers() {
    return [...PLAYERS, ...customPlayers];
}

const save    = () => fs.writeFileSync(DB_PATH, JSON.stringify(userData, null, 2));
const saveCustom = () => fs.writeFileSync(OYUNCU_PATH, JSON.stringify(customPlayers, null, 2));

const getUser = (id) => {
    if (!userData[id]) userData[id] = {
        balance: 5_000_000, squad: [],
        packUsed: false, lastClaim: 0, lastClaimPlayer: null,
        wins: 0, losses: 0, draws: 0
    };
    const u = userData[id];
    if (u.wins   == null) u.wins   = 0;
    if (u.losses == null) u.losses = 0;
    if (u.draws  == null) u.draws  = 0;
    return u;
};

// Admin ID - degistir
const ADMIN_IDS = ["ADMIN_DISCORD_ID_BURAYA"];
const isAdmin = (id) => ADMIN_IDS.includes(id);

const pendingMatches = new Map();
const activeMatches  = new Map();

// ── Ozel emojiler ─────────────────────────────────────────
const E = {
    asist:     "<:asist:1490062414585008299>",
    baslangic: "<:baslangic:1490063375521026149>",
    butce:     "<:butce:1490063438054166528>",
    cizgi:     "<:cizgi:1490061573056626771>",
    fiyat:     "<:fiyat:1490060354590605413>",
    futbolcu:  "<:futbolcu:1490059583941771274>",
    gol:       "<:gol:1490062357018316970>",
    hi:        "<:hi:1490061301051953264>",
    kirmizi:   "<:kirmizikart:1490062643359121640>",
    kurtaris:  "<:kurtaris:1490063156020772944>",
    lose:      "<:lose:1490063832591110336>",
    nokta:     "<:nokta:1490061537140805722>",
    onay:      "<:onay:1490060188172943491>",
    red:       "<:redd:1490060128551174366>",
    saha:      "<:saha:1490059050916773898>",
    sari:      "<:sarikart:1490062598261965002>",
    transfer:  "<:transfer:1490060267923701862>",
    urun:      "<:urun:1490060068111257728>",
    vs:        "<:vs:1490062285983453376>",
    win:       "<:win:1490063783278936277>",
    yardim:    "<:yardim:1490061427933843506>",
};

function rarityLabel(r) {
    return { bronz:"[BRONZ]", gumus:"[GUMUS]", altin:"[ALTIN]", elmas:"[ELMAS]", efsane:"[EFSANE]" }[r] || "";
}
function posLine(squad, pos) {
    const list = squad.filter(x => x.pos === pos);
    if (!list.length) return `${E.nokta} *- Bos -*`;
    return list.map(p => `${E.futbolcu} **${p.name}** ${E.cizgi} ${p.rating}`).join("\n");
}

// ============================================================
//  CV2 GONDERI
// ============================================================
const CV2 = [MessageFlags.IsComponentsV2];
const cvSend   = (ch, c, files=[]) => ch.send({ components:[c.toJSON()], flags:CV2, files });
const cvUpdate = (i, c, files=[])  => i.update({ components:[c.toJSON()], flags:CV2, content:null, embeds:[], files });

function cvInfo(baslik, icerik) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(baslik))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(icerik));
}
function cvConfirm(baslik, icerik, okId, okLabel, okStyle) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(baslik))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(icerik))
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(okId).setLabel(okLabel).setStyle(okStyle),
            new ButtonBuilder().setCustomId("CN").setLabel("Iptal").setStyle(ButtonStyle.Secondary)
        ));
}

// ── YARDIM ────────────────────────────────────────────────
function cvYardim() {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.yardim} **RYWEN FC ${E.cizgi} KOMUT LISTESI**`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.baslangic} \`!pack\` ${E.cizgi} Baslangic kadrosu al *(bir kez)*\n` +
            `${E.saha} \`!kadro\` ${E.cizgi} Kadronu goster\n` +
            `${E.transfer} \`!shop\` ${E.cizgi} Transfer merkezi\n` +
            `${E.urun} \`!sat\` ${E.cizgi} Oyuncu sat\n` +
            `${E.futbolcu} \`!degistir\` ${E.cizgi} Kadrodaki oyuncuyu degistir\n` +
            `${E.gol} \`!claim\` ${E.cizgi} Her 5 saatte ucretsiz oyuncu\n` +
            `${E.vs} \`!mac @kullanici\` ${E.cizgi} Mac daveti gonder\n` +
            `${E.butce} \`!bakiye\` ${E.cizgi} Bakiyeni gor\n` +
            `${E.futbolcu} \`!kart @kullanici [sira]\` ${E.cizgi} Oyuncu karti goster\n` +
            `${E.nokta} \`!bilgi [oyuncu adi]\` ${E.cizgi} Oyuncu detaylari\n\n` +
            `**${E.onay} ADMIN KOMUTLARI**\n` +
            `\`!oyuncuekle\` ${E.cizgi} Yeni oyuncu ekle *(adim adim)*\n` +
            `\`!oyuncusil [ad]\` ${E.cizgi} Custom oyuncuyu sil\n` +
            `\`!oyunculiste\` ${E.cizgi} Eklenen custom oyunculari gor`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Developed by RevanDev ZAD*`));
}

// ── KADRO ─────────────────────────────────────────────────
function cvKadro(username, user) {
    const guc = calcTeamStrength(user.squad);
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.saha} **${username} ${E.cizgi} KADRO**`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**${E.nokta} FORVET**\n${posLine(user.squad, "ATT")}`
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**${E.nokta} ORTA SAHA**\n${posLine(user.squad, "MID")}`
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**${E.nokta} DEFANS**\n${posLine(user.squad, "DEF")}`
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**${E.nokta} KALECI**\n${posLine(user.squad, "GK")}`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.futbolcu} **Guc:** ${guc} ${E.cizgi} ${E.butce} **Bakiye:** ${fmt(user.balance)}\n` +
            `${E.win} ${user.wins}G ${E.cizgi} ${E.lose} ${user.losses}M ${E.cizgi} ${E.nokta} ${user.draws}B`
        ));
}

// ── SHOP ──────────────────────────────────────────────────
function cvShop() {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.transfer} **RYWEN TRANSFER MERKEZI**`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.nokta} Hangi mevkide oyuncu ariyorsun?`
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("shop_GK").setLabel("Kaleciler").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("shop_DEF").setLabel("Defanslar").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("shop_MID").setLabel("Orta Sahalar").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("shop_ATT").setLabel("Forvetler").setStyle(ButtonStyle.Secondary)
        ));
}

function cvShopList(pos, menu) {
    const names = { GK:"Kaleciler", DEF:"Defanslar", MID:"Orta Sahalar", ATT:"Forvetler" };
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.transfer} **${names[pos]} PAZARI**`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.futbolcu} Listeden oyuncu sec:`))
        .addActionRowComponents(new ActionRowBuilder().addComponents(menu));
}

function cvSellMenu(menu) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.urun} **OYUNCU SAT**`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Satmak istedigin oyuncuyu sec:"))
        .addActionRowComponents(new ActionRowBuilder().addComponents(menu));
}

function cvSwapSquad(menu) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.futbolcu} **KADRO DEGISTIRME**`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            "Kadrondan hangi oyuncuyu **cikarmak** istiyorsun?"
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(menu));
}
function cvSwapNew(outName, menu) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.futbolcu} **KADRO DEGISTIRME**`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.red} **${outName}** cikacak. Yerine kim gelsin?`
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(menu));
}

function cvPack(squad) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.baslangic} **BASLANGIC PAKETI ACILDI**`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            squad.map(p =>
                `${E.futbolcu} **${p.name}** ${E.cizgi} *${p.pos}* ${E.cizgi} **${p.rating}**`
            ).join("\n")
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Tum oyuncular 60 puan ve altinda.*`));
}

function cvClaim(p) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.gol} **UCRETSIZ OYUNCU KAZANILDI**`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.futbolcu} **${p.name}**\n` +
            `${E.nokta} *${p.pos}* ${E.cizgi} **${p.rating}** puan ${E.cizgi} ${rarityLabel(p.rarity)}\n` +
            (p.team ? `${E.transfer} *${p.team}*` : "")
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Bir sonraki claim 5 saat sonra.*`));
}

function cvMacDavet(cName, targetMention, cStr, tStr, inviteKey) {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.vs} **MAC DAVETI**`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.hi} **${cName}** seni mac yapmaya davet ediyor, ${targetMention}!\n\n` +
            `${E.futbolcu} Davetci takim gucu: **${cStr}**\n` +
            `${E.futbolcu} Senin takim gucun: **${tStr}**`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`MAC_ACCEPT_${inviteKey}`).setLabel("Kabul Et").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`MAC_REJECT_${inviteKey}`).setLabel("Reddet").setStyle(ButtonStyle.Danger)
        ));
}

function cvMacPanel(matchKey, cName, tName, cGoals, tGoals, dakika, olaylar, siradakiAd) {
    const son = olaylar.slice(-5).join("\n") || `${E.nokta} *Mac basladi!*`;
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.saha} **${cName}  ${E.vs}  ${tName}**`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.gol} **${cGoals} ${E.cizgi} ${tGoals}** ${E.nokta} *${dakika}. dakika*`
        ))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(son))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${E.nokta} Siradaki hamle: **${siradakiAd}**`
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`MAC_ATTAK_${matchKey}`).setLabel("Hucum").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`MAC_SAVUN_${matchKey}`).setLabel("Savunma").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`MAC_ORTA_${matchKey}`).setLabel("Orta Saha").setStyle(ButtonStyle.Secondary)
        ));
}

function cvMacBitis(cName, tName, cGoals, tGoals, olaylar, odul) {
    let sonuc;
    if (cGoals > tGoals)      sonuc = `${E.win} **${cName}** kazandi!${odul ? `  ${E.cizgi}  +${fmt(odul)}` : ""}`;
    else if (tGoals > cGoals) sonuc = `${E.win} **${tName}** kazandi!${odul ? `  ${E.cizgi}  +${fmt(odul)}` : ""}`;
    else                      sonuc = `${E.nokta} **Berabere!**`;
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${E.saha} **MAC SONU**`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**${cName}  ${cGoals} ${E.cizgi} ${tGoals}  ${tName}**\n\n${sonuc}`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            olaylar.join("\n") || `${E.nokta} *Olaysiz bir mac.*`
        ));
}

// ============================================================
//  MAC MOTORU
// ============================================================
const rand  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randP = (sq)  => sq[Math.floor(Math.random() * sq.length)]?.name || "Oyuncu";
const SPK = {
    golC: (p,d) => rand([
        `${E.gol} **${d}. DAK** ${E.cizgi} **GOOOL!** ${p} defansi yirtti, top agda!`,
        `${E.gol} **${d}. DAK** ${E.cizgi} ${p} sol koseye carparak vurdu, GOOOL!`,
        `${E.gol} **${d}. DAK** ${E.cizgi} Nefes kesen bitis! ${p} topu aga gonderiyor!`,
    ]),
    golT: (p,d) => rand([
        `${E.gol} **${d}. DAK** ${E.cizgi} **KARSI ATAK GOL!** ${p} firsati degerlendirildi!`,
        `${E.gol} **${d}. DAK** ${E.cizgi} ${p} sogukkanliligiyla topu kovaya yerlestirdi!`,
    ]),
    asist:    (p,d) => `${E.asist} **${d}. DAK** ${E.cizgi} ${p} mukemmel bir pas aciyor!`,
    kurtaris: (p,d) => rand([
        `${E.kurtaris} **${d}. DAK** ${E.cizgi} MUHTESEM! ${p} tek elle topu kornere gonderiyor!`,
        `${E.kurtaris} **${d}. DAK** ${E.cizgi} ${p} kapatan kurtaris yapiyor!`,
    ]),
    sari:    (p,d) => `${E.sari} **${d}. DAK** ${E.cizgi} ${p} sari kart gordu!`,
    direk:   (d)   => `${E.nokta} **${d}. DAK** ${E.cizgi} TOP DIREK! Sahada sessizlik...`,
    normal:  (d)   => `${E.nokta} **${d}. DAK** ${E.cizgi} Oyun orta sahada donuyor.`,
};

function macHamle(state, hamle) {
    const d = state.dakika;
    let gC = 0.26, gT = 0.14;
    if (hamle === "attak") { gC = 0.42; gT = 0.07; }
    if (hamle === "savun") { gC = 0.10; gT = 0.05; }
    if (hamle === "orta")  { gC = 0.26; gT = 0.18; }
    const diff = (calcTeamStrength(state.cSquad) - calcTeamStrength(state.tSquad)) / 200;
    gC = Math.max(0.04, Math.min(0.75, gC + diff));
    gT = Math.max(0.02, Math.min(0.60, gT - diff));
    const roll = Math.random();
    const attC = state.cSquad.filter(p => p.pos === "ATT");
    const midC = state.cSquad.filter(p => p.pos === "MID");
    const attT = state.tSquad.filter(p => p.pos === "ATT");
    const gkC  = state.cSquad.filter(p => p.pos === "GK");
    if (roll < gC) {
        const ata = randP(attC.length ? attC : state.cSquad);
        const mid = randP(midC.length ? midC : state.cSquad);
        if (Math.random() < 0.55) state.olaylar.push(SPK.asist(mid, d));
        state.olaylar.push(SPK.golC(ata, d));
        state.cGoals++;
    } else if (roll < gC + gT) {
        state.olaylar.push(SPK.golT(randP(attT.length ? attT : state.tSquad), d));
        state.tGoals++;
    } else if (roll < gC + gT + 0.10) {
        state.olaylar.push(SPK.kurtaris(randP(gkC.length ? gkC : state.cSquad), d));
    } else if (roll < gC + gT + 0.15) {
        state.olaylar.push(SPK.direk(d));
    } else if (roll < gC + gT + 0.19) {
        state.olaylar.push(SPK.sari(randP(state.cSquad), d));
    } else {
        state.olaylar.push(SPK.normal(d));
    }
    state.dakika = Math.min(90, d + Math.floor(Math.random() * 13) + 7);
}

// ── Canvas kart yardimci ──────────────────────────────────
async function sendPlayerCard(channel, player, extraDesc = "") {
    const stats  = generateStats(player);
    const desc   =
        `${E.futbolcu} **${player.name}**\n` +
        `${E.nokta} *${player.pos}* ${E.cizgi} **${player.rating}** puan ${E.cizgi} ${rarityLabel(player.rarity)}\n` +
        (player.team ? `${E.transfer} *${player.team}*\n` : "") +
        (extraDesc ? `\n${extraDesc}` : "");

    if (cardGen) {
        try {
            const buffer = await cardGen.generatePlayerCard(player, stats);
            const attach = new AttachmentBuilder(buffer, { name: "kart.png" });
            return cvSend(channel, cvInfo(`${E.futbolcu} **OYUNCU KARTI**`, desc), [attach]);
        } catch (e) {
            console.error("Kart hatasi:", e.message);
        }
    }
    return cvSend(channel, cvInfo(`${E.futbolcu} **OYUNCU KARTI**`, desc));
}

// ============================================================
//  OYUNCU EKLEME OTURUMU (adim adim DM ya da kanalda)
// ============================================================
const addSessions = new Map(); // userId -> { step, data }

const ADD_STEPS = [
    { key: "name",    soru: `**1/8** ${E.futbolcu} Oyuncunun **adini** yaz:` },
    { key: "pos",     soru: `**2/8** ${E.nokta} Mevkisini yaz: **GK / DEF / MID / ATT**` },
    { key: "rating",  soru: `**3/8** ${E.nokta} Rating gir (**50-99**):` },
    { key: "rarity",  soru: `**4/8** ${E.nokta} Rarity yaz: **bronz / gumus / altin / elmas / efsane**` },
    { key: "team",    soru: `**5/8** ${E.transfer} Takim adi yaz *(yoksa \`yok\` yaz)*:` },
    { key: "image",   soru: `**6/8** ${E.futbolcu} Oyuncu fotografi:\n${E.nokta} Lokal dosya: \`./images/oyuncu.png\`\n${E.nokta} URL: \`https://...\`\n${E.nokta} Yoksa: \`yok\`\n*(Fotoyu direkt Discord'a yukleyebilirsin, otomatik alir)*` },
    { key: "nat",     soru: `**7/8** ${E.nokta} Uyruk/milliyet yaz *(yoksa \`yok\` yaz)*:` },
    { key: "confirm", soru: "" }, // onay
];

// ============================================================
//  MESAJ KOMUTLARI
// ============================================================
client.on(Events.ClientReady, () =>
    console.log("Rywen FC Bot v11.0 aktif  |  Developed by RevanDev ZAD")
);

client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot) return;

    // ── Oyuncu ekleme oturumu aktifse mesajlari yakala ──
    if (addSessions.has(m.author.id)) {
        const session = addSessions.get(m.author.id);
        await handleAddStep(m, session);
        return;
    }

    if (!m.content.startsWith("!")) return;
    const args = m.content.slice(1).trim().split(/\s+/);
    const cmd  = args[0].toLowerCase();
    const user = getUser(m.author.id);

    if (cmd === "yardim" || cmd === "help")
        return cvSend(m.channel, cvYardim());

    if (cmd === "shop")
        return cvSend(m.channel, cvShop());

    if (cmd === "kadro")
        return cvSend(m.channel, cvKadro(m.author.username, user));

    if (cmd === "bakiye")
        return cvSend(m.channel, cvInfo(
            `${E.butce} **BAKiYE**`,
            `${m.author.username}: **${fmt(user.balance)}**`
        ));

    if (cmd === "sat") {
        if (!user.squad.length) return m.reply(`${E.red} Kadron bos.`);
        const menu = new StringSelectMenuBuilder()
            .setCustomId("sell_menu").setPlaceholder("Satilacak oyuncuyu sec...");
        user.squad.slice(0, 25).forEach((p, i) => menu.addOptions({
            label: p.name,
            description: `${p.pos} | ${p.rating} puan | ${fmt(getSellPrice(p.rating))}`,
            value: `${i}`
        }));
        return cvSend(m.channel, cvSellMenu(menu));
    }

    if (cmd === "degistir") {
        if (!user.squad.length) return m.reply(`${E.red} Kadron bos.`);
        const menu = new StringSelectMenuBuilder()
            .setCustomId("swap_squad_select").setPlaceholder("Kadrodan cikacak oyuncuyu sec...");
        user.squad.slice(0, 25).forEach((p, i) => menu.addOptions({
            label: p.name,
            description: `${p.pos} | ${p.rating} puan`,
            value: `${i}`
        }));
        return cvSend(m.channel, cvSwapSquad(menu));
    }

    if (cmd === "pack") {
        if (user.packUsed) return m.reply(`${E.red} Baslangic paketini zaten kullandin.`);
        user.squad    = getStarterPack();
        user.packUsed = true;
        save();
        return cvSend(m.channel, cvPack(user.squad));
    }

    if (cmd === "claim") {
        const now  = Date.now();
        const diff = now - user.lastClaim;
        if (diff < 18_000_000) {
            const kalan = Math.ceil((18_000_000 - diff) / 60_000);
            return m.reply(`${E.red} Bir sonraki claim icin **${kalan}** dakika beklemelisin.`);
        }
        const allP = getAllPlayers().filter(p => p.rating <= 80);
        let p; let att = 0;
        do {
            p = getWeightedRandom(user.lastClaimPlayer);
            att++;
        } while (p.name === user.lastClaimPlayer && att < 15);
        user.squad.push(p);
        user.lastClaim       = now;
        user.lastClaimPlayer = p.name;
        save();
        if (cardGen) {
            try {
                const stats  = generateStats(p);
                const buffer = await cardGen.generatePlayerCard(p, stats);
                const attach = new AttachmentBuilder(buffer, { name: "kart.png" });
                return cvSend(m.channel, cvClaim(p), [attach]);
            } catch (_) {}
        }
        return cvSend(m.channel, cvClaim(p));
    }

    // !kart @kullanici [sira]
    if (cmd === "kart") {
        if (!cardGen) return m.reply(`${E.red} Canvas yuklu degil. Kurmak: \`npm install @napi-rs/canvas\``);
        const target  = m.mentions.users.first() || m.author;
        const tUser   = getUser(target.id);
        const idx     = (parseInt(args[2]) || parseInt(args[1]) || 1) - 1;
        if (!tUser.squad.length) return m.reply(`${E.red} Bu kullanicinin kadrosu bos.`);
        if (idx < 0 || idx >= tUser.squad.length)
            return m.reply(`${E.red} Gecersiz sira. Kadro ${tUser.squad.length} oyuncu iceriyor.`);
        const p = tUser.squad[idx];
        await sendPlayerCard(m.channel, p);
    }

    // !bilgi [oyuncu adi]
    if (cmd === "bilgi") {
        const query = args.slice(1).join(" ").toLowerCase();
        if (!query) return m.reply("Kullanim: `!bilgi [oyuncu adi]`");
        const p = getAllPlayers().find(x => x.name.toLowerCase().includes(query));
        if (!p) return m.reply(`${E.red} **${query}** adinda oyuncu bulunamadi.`);
        const stats = generateStats(p);
        const desc  =
            `${E.futbolcu} **Mevki:** ${p.pos}\n` +
            `${E.nokta} **Puan:** ${p.rating}\n` +
            `${E.nokta} **Rarity:** ${rarityLabel(p.rarity)}\n` +
            (p.team ? `${E.transfer} **Takim:** ${p.team}\n` : "") +
            `${E.fiyat} **Alis:** ${fmt(getBuyPrice(p.rating))}\n` +
            `${E.urun} **Satis:** ${fmt(getSellPrice(p.rating))}\n\n` +
            `**${E.cizgi} STATLAR ${E.cizgi}**\n` +
            `Hiz: **${stats.hiz}** ${E.nokta} Sut: **${stats.sut}** ${E.nokta} Pas: **${stats.pas}**\n` +
            `Def: **${stats.def}** ${E.nokta} Fizik: **${stats.fizik}** ${E.nokta} Dribbling: **${stats.dribbling}**`;
        if (cardGen) {
            try {
                const buffer = await cardGen.generatePlayerCard(p, stats);
                const attach = new AttachmentBuilder(buffer, { name: "kart.png" });
                return cvSend(m.channel, cvInfo(`${E.futbolcu} **${p.name}**`, desc), [attach]);
            } catch (_) {}
        }
        return cvSend(m.channel, cvInfo(`${E.futbolcu} **${p.name}**`, desc));
    }

    // ── ADMIN: Oyuncu ekle ─────────────────────────────────
    if (cmd === "oyuncuekle") {
        if (!isAdmin(m.author.id))
            return m.reply(`${E.red} Bu komut sadece adminlere ozgu.`);
        // Oturum baslat
        addSessions.set(m.author.id, { step: 0, data: {}, channelId: m.channel.id });
        return cvSend(m.channel, cvInfo(
            `${E.onay} **YENI OYUNCU EKLEME**`,
            `${ADD_STEPS[0].soru}\n\n*Iptal etmek icin: \`!iptal\`*`
        ));
    }

    // ── ADMIN: Oyuncu sil ──────────────────────────────────
    if (cmd === "oyuncusil") {
        if (!isAdmin(m.author.id)) return m.reply(`${E.red} Bu komut sadece adminlere ozgu.`);
        const name = args.slice(1).join(" ");
        if (!name) return m.reply("Kullanim: `!oyuncusil [oyuncu adi]`");
        const idx = customPlayers.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
        if (idx === -1) return m.reply(`${E.red} **${name}** custom oyuncular listesinde bulunamadi.`);
        const removed = customPlayers.splice(idx, 1)[0];
        saveCustom();
        return cvSend(m.channel, cvInfo(`${E.onay} **Oyuncu Silindi**`,
            `${E.futbolcu} **${removed.name}** listeden kaldirildi.`));
    }

    // ── ADMIN: Custom oyuncu listesi ──────────────────────
    if (cmd === "oyunculiste") {
        if (!isAdmin(m.author.id)) return m.reply(`${E.red} Bu komut sadece adminlere ozgu.`);
        if (!customPlayers.length)
            return cvSend(m.channel, cvInfo(`${E.futbolcu} **CUSTOM OYUNCULAR**`, `*Henuz custom oyuncu eklenmedi.*`));
        const liste = customPlayers.map(p =>
            `${E.nokta} **${p.name}** ${E.cizgi} *${p.pos}* ${E.cizgi} ${p.rating} ${E.cizgi} ${p.team || "-"}`
        ).join("\n");
        return cvSend(m.channel, cvInfo(`${E.futbolcu} **CUSTOM OYUNCULAR** (${customPlayers.length})`, liste));
    }

    if (cmd === "iptal") {
        if (addSessions.has(m.author.id)) {
            addSessions.delete(m.author.id);
            return m.reply(`${E.red} Oyuncu ekleme iptal edildi.`);
        }
    }

    // !mac @kullanici
    if (cmd === "mac") {
        const target = m.mentions.users.first();
        if (!target)                   return m.reply("Kullanim: `!mac @kullanici`");
        if (target.bot)                return m.reply(`${E.red} Bota mac daveti gonderemezsin.`);
        if (target.id === m.author.id) return m.reply(`${E.red} Kendine mac daveti gonderemezsin.`);
        const cUser = user, tUser = getUser(target.id);
        if (!cUser.squad.length) return m.reply(`${E.red} Kadron bos.`);
        if (!tUser.squad.length) return m.reply(`${E.red} ${target.username} kadrosu bos.`);
        const inviteKey = `${m.author.id}_${target.id}_${Date.now()}`;
        const cStr = calcTeamStrength(cUser.squad);
        const tStr = calcTeamStrength(tUser.squad);
        const sent = await cvSend(m.channel,
            cvMacDavet(m.author.username, `<@${target.id}>`, cStr, tStr, inviteKey)
        );
        pendingMatches.set(inviteKey, { challengerId: m.author.id, targetId: target.id, channelId: m.channel.id, msgId: sent.id });
        setTimeout(async () => {
            if (pendingMatches.has(inviteKey)) {
                pendingMatches.delete(inviteKey);
                try { await sent.edit({ components: [] }); } catch (_) {}
            }
        }, 90_000);
    }
});

// ── Oyuncu ekleme adim isleme ─────────────────────────────
async function handleAddStep(m, session) {
    const text = m.content.trim();

    if (text.toLowerCase() === "!iptal") {
        addSessions.delete(m.author.id);
        return m.reply(`${E.red} Oyuncu ekleme iptal edildi.`);
    }

    const step = ADD_STEPS[session.step];

    // ── Adim validasyonlari ───────────────────────────────
    if (step.key === "pos") {
        const val = text.toUpperCase();
        if (!["GK","DEF","MID","ATT"].includes(val))
            return m.reply(`${E.red} Gecersiz mevki. **GK / DEF / MID / ATT** yaz.`);
        session.data.pos = val;
    }
    else if (step.key === "rating") {
        const val = parseInt(text);
        if (isNaN(val) || val < 50 || val > 99)
            return m.reply(`${E.red} Gecersiz rating. 50-99 arasi bir sayi gir.`);
        session.data.rating = val;
    }
    else if (step.key === "rarity") {
        const val = text.toLowerCase();
        if (!["bronz","gumus","altin","elmas","efsane"].includes(val))
            return m.reply(`${E.red} Gecersiz rarity. **bronz / gumus / altin / elmas / efsane** yaz.`);
        session.data.rarity = val;
    }
    else if (step.key === "team") {
        session.data.team = text.toLowerCase() === "yok" ? null : text;
    }
    else if (step.key === "image") {
        // Discord'a eklenen dosyayi kontrol et
        const attachment = m.attachments.first();
        if (attachment) {
            session.data.image = attachment.url; // URL olarak sakla
        } else if (text.toLowerCase() === "yok") {
            session.data.image = null;
        } else {
            session.data.image = text; // Lokal yol veya URL
        }
    }
    else if (step.key === "nat") {
        session.data.nat = text.toLowerCase() === "yok" ? null : text;
    }
    else if (step.key === "name") {
        session.data.name = text;
    }

    // ── Onay adimi ────────────────────────────────────────
    if (step.key === "nat") {
        // Bir sonraki adim onay
        session.step++;
        const d = session.data;
        const ozet =
            `${E.futbolcu} **Ad:** ${d.name}\n` +
            `${E.nokta} **Mevki:** ${d.pos}\n` +
            `${E.nokta} **Rating:** ${d.rating}\n` +
            `${E.nokta} **Rarity:** ${rarityLabel(d.rarity)}\n` +
            (d.team ? `${E.transfer} **Takim:** ${d.team}\n` : "") +
            (d.nat  ? `${E.nokta} **Uyruk:** ${d.nat}\n`    : "") +
            `${E.nokta} **Foto:** ${d.image ? "Var" : "Yok (silhouette)"}`;

        return cvSend(m.channel, cvConfirm(
            `${E.onay} **ONAY ${E.cizgi} Oyuncu Eklenecek**`,
            ozet,
            "ADD_CONFIRM", "Onayla ve Ekle", ButtonStyle.Success
        ));
    }

    // ── Sonraki adima gec ─────────────────────────────────
    session.step++;
    const nextStep = ADD_STEPS[session.step];
    if (nextStep && nextStep.key !== "confirm") {
        return cvSend(m.channel, cvInfo(
            `${E.onay} **YENI OYUNCU ${E.cizgi} ${session.step + 1}/${ADD_STEPS.length - 1}**`,
            `${nextStep.soru}\n\n*Iptal: \`!iptal\`*`
        ));
    }
}

// ============================================================
//  INTERACTION HANDLER
// ============================================================
client.on(Events.InteractionCreate, async (i) => {
    const user = getUser(i.user.id);
    const allP = getAllPlayers();

    // ── Oyuncu ekleme onay ────────────────────────────────
    if (i.isButton() && i.customId === "ADD_CONFIRM") {
        const session = addSessions.get(i.user.id);
        if (!session) return cvUpdate(i, cvInfo(`${E.red} Hata`, "Oturum bulunamadi."));
        addSessions.delete(i.user.id);
        const d = session.data;
        const yeniOyuncu = {
            name:   d.name,
            pos:    d.pos,
            rating: d.rating,
            rarity: d.rarity,
            team:   d.team   || null,
            image:  d.image  || null,
            nat:    d.nat    || null,
        };
        // Ayni isimde varsa guncelle, yoksa ekle
        const existIdx = customPlayers.findIndex(p => p.name.toLowerCase() === d.name.toLowerCase());
        if (existIdx >= 0) customPlayers[existIdx] = yeniOyuncu;
        else customPlayers.push(yeniOyuncu);
        saveCustom();

        // Kart goster
        if (cardGen) {
            try {
                const stats  = generateStats(yeniOyuncu);
                const buffer = await cardGen.generatePlayerCard(yeniOyuncu, stats);
                const attach = new AttachmentBuilder(buffer, { name: "kart.png" });
                return cvUpdate(i, cvInfo(
                    `${E.onay} **Oyuncu Eklendi**`,
                    `${E.futbolcu} **${yeniOyuncu.name}** sisteme eklendi!\n${E.transfer} ${yeniOyuncu.team || "-"} ${E.cizgi} ${yeniOyuncu.rating} puan`
                ), [attach]);
            } catch (_) {}
        }
        return cvUpdate(i, cvInfo(
            `${E.onay} **Oyuncu Eklendi**`,
            `${E.futbolcu} **${yeniOyuncu.name}** sisteme eklendi!`
        ));
    }

    // ── SHOP mevki buton ──────────────────────────────────
    if (i.isButton() && i.customId.startsWith("shop_")) {
        const pos  = i.customId.split("_")[1];
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`buy_menu_${pos}`).setPlaceholder("Oyuncu sec...");
        allP.filter(p => p.pos === pos).slice(0, 25).forEach(p => menu.addOptions({
            label: p.name,
            description: `${rarityLabel(p.rarity)} ${p.rating} puan - ${fmt(getBuyPrice(p.rating))}`,
            value: p.name
        }));
        return cvUpdate(i, cvShopList(pos, menu));
    }

    // ── Satin alma select ─────────────────────────────────
    if (i.isStringSelectMenu() && i.customId.startsWith("buy_menu")) {
        const p   = allP.find(x => x.name === i.values[0]);
        const desc =
            `${E.futbolcu} **${p.name}** ${E.cizgi} *${p.pos}* ${E.cizgi} **${p.rating}** puan ${rarityLabel(p.rarity)}\n` +
            (p.team ? `${E.transfer} *${p.team}*\n\n` : "\n") +
            `${E.fiyat} Fiyat: **${fmt(getBuyPrice(p.rating))}**\n` +
            `${E.butce} Bakiyeniz: **${fmt(user.balance)}**`;
        return cvUpdate(i, cvConfirm(
            `${E.transfer} **SATIN ALMA ONAY**`, desc,
            `B_OK_${p.name}`, "Satin Al", ButtonStyle.Success
        ));
    }

    // ── Satin alma buton ──────────────────────────────────
    if (i.isButton() && i.customId.startsWith("B_OK_")) {
        const name = i.customId.split("_").slice(2).join("_");
        const p    = allP.find(x => x.name === name);
        if (!p) return cvUpdate(i, cvInfo(`${E.red} Hata`, "Oyuncu bulunamadi."));
        const cost = getBuyPrice(p.rating);
        if (user.balance < cost)
            return cvUpdate(i, cvInfo(`${E.red} **Yetersiz Bakiye**`,
                `Gereken: **${fmt(cost)}**\nBakiyeniz: **${fmt(user.balance)}**`));
        user.balance -= cost;
        user.squad.push(p);
        save();
        if (cardGen) {
            try {
                const stats  = generateStats(p);
                const buffer = await cardGen.generatePlayerCard(p, stats);
                const attach = new AttachmentBuilder(buffer, { name: "kart.png" });
                return cvUpdate(i, cvInfo(`${E.onay} **Satin Alma Basarili**`,
                    `${E.futbolcu} **${p.name}** kadronuza eklendi.\n${E.butce} Kalan bakiye: **${fmt(user.balance)}**`
                ), [attach]);
            } catch (_) {}
        }
        return cvUpdate(i, cvInfo(`${E.onay} **Satin Alma Basarili**`,
            `${E.futbolcu} **${p.name}** kadronuza eklendi.\n${E.butce} Kalan bakiye: **${fmt(user.balance)}**`));
    }

    // ── Satis select ──────────────────────────────────────
    if (i.isStringSelectMenu() && i.customId === "sell_menu") {
        const idx = parseInt(i.values[0]);
        const p   = user.squad[idx];
        const desc =
            `${E.futbolcu} **${p.name}** ${E.cizgi} *${p.pos}* ${E.cizgi} **${p.rating}** puan\n\n` +
            `${E.fiyat} Satis bedeli: **${fmt(getSellPrice(p.rating))}**\n` +
            `${E.butce} Bakiyeniz: **${fmt(user.balance)}**`;
        return cvUpdate(i, cvConfirm(
            `${E.urun} **SATIS ONAY**`, desc,
            `S_OK_${idx}`, "Sat", ButtonStyle.Danger
        ));
    }

    // ── Satis buton ───────────────────────────────────────
    if (i.isButton() && i.customId.startsWith("S_OK_")) {
        const idx = parseInt(i.customId.split("_")[2]);
        const p   = user.squad[idx];
        if (!p) return cvUpdate(i, cvInfo(`${E.red} Hata`, "Oyuncu bulunamadi."));
        const earned = getSellPrice(p.rating);
        user.balance += earned;
        user.squad.splice(idx, 1);
        save();
        return cvUpdate(i, cvInfo(`${E.onay} **Satis Basarili**`,
            `${E.futbolcu} **${p.name}** satildi.\n${E.butce} Kazanilan: **${fmt(earned)}** ${E.cizgi} Bakiye: **${fmt(user.balance)}**`));
    }

    // ── Degistir: kadrodan sec ────────────────────────────
    if (i.isStringSelectMenu() && i.customId === "swap_squad_select") {
        const outIdx = parseInt(i.values[0]);
        const outP   = user.squad[outIdx];
        if (!outP) return cvUpdate(i, cvInfo(`${E.red} Hata`, "Oyuncu bulunamadi."));
        const newMenu = new StringSelectMenuBuilder()
            .setCustomId(`swap_new_select_${outIdx}`).setPlaceholder("Yerine gelecek oyuncuyu sec...");
        allP.slice(0, 25).forEach(p => newMenu.addOptions({
            label: p.name,
            description: `${p.pos} | ${p.rating} puan | ${fmt(getBuyPrice(p.rating))}`,
            value: p.name
        }));
        return cvUpdate(i, cvSwapNew(outP.name, newMenu));
    }

    // ── Degistir: yeni sec ────────────────────────────────
    if (i.isStringSelectMenu() && i.customId.startsWith("swap_new_select_")) {
        const outIdx = parseInt(i.customId.split("_")[3]);
        const outP   = user.squad[outIdx];
        const newP   = allP.find(p => p.name === i.values[0]);
        if (!outP || !newP) return cvUpdate(i, cvInfo(`${E.red} Hata`, "Oyuncu bulunamadi."));
        const cost = getBuyPrice(newP.rating);
        const desc =
            `${E.red} **${outP.name}** cikacak\n` +
            `${E.onay} **${newP.name}** (${newP.rating} puan) girecek\n\n` +
            `${E.fiyat} Maliyet: **${fmt(cost)}**\n` +
            `${E.butce} Bakiyeniz: **${fmt(user.balance)}**`;
        return cvUpdate(i, cvConfirm(
            `${E.futbolcu} **DEGISTIRME ONAY**`, desc,
            `SWAP_OK_${outIdx}_${newP.name}`, "Onayla", ButtonStyle.Success
        ));
    }

    // ── Degistir: onayla ──────────────────────────────────
    if (i.isButton() && i.customId.startsWith("SWAP_OK_")) {
        const parts  = i.customId.split("_");
        const outIdx = parseInt(parts[2]);
        const newName= parts.slice(3).join("_");
        const outP   = user.squad[outIdx];
        const newP   = allP.find(p => p.name === newName);
        if (!outP || !newP) return cvUpdate(i, cvInfo(`${E.red} Hata`, "Oyuncu bulunamadi."));
        const cost = getBuyPrice(newP.rating);
        if (user.balance < cost)
            return cvUpdate(i, cvInfo(`${E.red} **Yetersiz Bakiye**`,
                `Gereken: **${fmt(cost)}**\nBakiyeniz: **${fmt(user.balance)}**`));
        user.balance -= cost;
        user.squad.splice(outIdx, 1, newP);
        save();
        return cvUpdate(i, cvInfo(`${E.onay} **Degistirme Tamamlandi**`,
            `**${outP.name}** cikti, **${newP.name}** girdi.\n${E.butce} Bakiye: **${fmt(user.balance)}**`));
    }

    // ── Iptal ─────────────────────────────────────────────
    if (i.isButton() && i.customId === "CN")
        return cvUpdate(i, cvInfo(`${E.red} **Iptal**`, "Islem iptal edildi."));

    // ── Mac kabul / red ───────────────────────────────────
    if (i.isButton() && (i.customId.startsWith("MAC_ACCEPT_") || i.customId.startsWith("MAC_REJECT_"))) {
        const isAccept  = i.customId.startsWith("MAC_ACCEPT_");
        const inviteKey = i.customId.replace("MAC_ACCEPT_","").replace("MAC_REJECT_","");
        const match     = pendingMatches.get(inviteKey);
        if (!match) return cvUpdate(i, cvInfo(`${E.red} **Gecersiz Davet**`, "Bu davet suresi doldu."));
        if (i.user.id !== match.targetId)
            return i.reply({ content: "Bu davet sana ait degil.", ephemeral: true });
        pendingMatches.delete(inviteKey);
        if (!isAccept) return cvUpdate(i, cvInfo(`${E.lose} **Mac Reddedildi**`, `**${i.user.username}** daveti reddetti.`));

        const cUser = getUser(match.challengerId);
        const tUser = getUser(match.targetId);
        const challenger = await client.users.fetch(match.challengerId);
        const target     = await client.users.fetch(match.targetId);
        const matchKey   = `match_${match.challengerId}_${match.targetId}_${Date.now()}`;
        activeMatches.set(matchKey, {
            challengerId: match.challengerId, targetId: match.targetId,
            cName: challenger.username, tName: target.username,
            cSquad: [...cUser.squad], tSquad: [...tUser.squad],
            cGoals: 0, tGoals: 0, dakika: 1, olaylar: [], hamleNo: 0, sira: "challenger",
        });
        const st = activeMatches.get(matchKey);
        return cvUpdate(i, cvMacPanel(matchKey, st.cName, st.tName, 0, 0, 1,
            [`${E.saha} Mac basladi! **${st.cName}** ilk hamleyi yapiyor.`], st.cName));
    }

    // ── Mac hamle ─────────────────────────────────────────
    if (i.isButton() && (i.customId.startsWith("MAC_ATTAK_") || i.customId.startsWith("MAC_SAVUN_") || i.customId.startsWith("MAC_ORTA_"))) {
        let hamle, matchKey;
        if (i.customId.startsWith("MAC_ATTAK_")) { hamle="attak"; matchKey=i.customId.replace("MAC_ATTAK_",""); }
        if (i.customId.startsWith("MAC_SAVUN_")) { hamle="savun"; matchKey=i.customId.replace("MAC_SAVUN_",""); }
        if (i.customId.startsWith("MAC_ORTA_"))  { hamle="orta";  matchKey=i.customId.replace("MAC_ORTA_","");  }

        const state = activeMatches.get(matchKey);
        if (!state) return cvUpdate(i, cvInfo(`${E.red} Hata`, "Mac bulunamadi."));
        if (i.user.id !== state.challengerId && i.user.id !== state.targetId)
            return i.reply({ content: "Bu mac sana ait degil.", ephemeral: true });
        const beklenen = state.sira === "challenger" ? state.challengerId : state.targetId;
        if (i.user.id !== beklenen)
            return i.reply({ content: "Siradaki hamle sende degil, rakibini bekle.", ephemeral: true });

        macHamle(state, hamle);
        state.hamleNo++;
        state.sira = state.sira === "challenger" ? "target" : "challenger";
        const macBitti = state.hamleNo >= 8 || state.dakika >= 90;

        if (macBitti) {
            activeMatches.delete(matchKey);
            const cUF = getUser(state.challengerId);
            const tUF = getUser(state.targetId);
            const odul = 150_000;
            if (state.cGoals > state.tGoals)      { cUF.balance+=odul; cUF.wins++;   tUF.losses++; }
            else if (state.tGoals > state.cGoals) { tUF.balance+=odul; tUF.wins++;   cUF.losses++; }
            else                                   { cUF.draws++;       tUF.draws++;  }
            save();
            if (cardGen) {
                try {
                    const cStr = calcTeamStrength(cUF.squad);
                    const tStr = calcTeamStrength(tUF.squad);
                    const buf  = cardGen.generateMatchCard(state.cName, state.tName, state.cGoals, state.tGoals, cStr, tStr);
                    const att  = new AttachmentBuilder(buf, { name: "mac_sonuc.png" });
                    return cvUpdate(i, cvMacBitis(state.cName, state.tName, state.cGoals, state.tGoals,
                        state.olaylar, state.cGoals !== state.tGoals ? odul : 0), [att]);
                } catch (_) {}
            }
            return cvUpdate(i, cvMacBitis(state.cName, state.tName, state.cGoals, state.tGoals,
                state.olaylar, state.cGoals !== state.tGoals ? odul : 0));
        }

        const siradakiAd = state.sira === "challenger" ? state.cName : state.tName;
        return cvUpdate(i, cvMacPanel(matchKey, state.cName, state.tName,
            state.cGoals, state.tGoals, state.dakika, state.olaylar, siradakiAd));
    }
});

client.login(process.env.DISCORD_TOKEN || "TOKEN_BURAYA");
