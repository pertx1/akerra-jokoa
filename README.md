# AKERRA JOKOA

"Etxea zaintzen" mini-jokoa AKERRA marka bertxentzat (Google Dinosaurio
estiloko endless-runner soil bat, HTML + CSS + JavaScript hutsean, canvas-ekin,
frameworkik gabe). Testu guztiak euskaraz daude.

## Fitxategiak

```
index.html    → egitura eta pantailak
style.css     → estiloa (mobile-first)
game.js       → jokoaren logika osoa (CONFIG objektua goian)
assets/       → irudi eta soinu guztiak (README propioa dauka barruan)
```

`assets/README.md` fitxategian irudi bakoitzaren neurria eta gardentasun
beharra daude zehaztuta, placeholder-ak azken irudiekin ordezkatzeko.

## Probatu lokalean

Ez da build-rik behar, baina fitxategiak zerbitzari lokal baten bidez
zerbitzatu behar dira (bestela `fetch`/irudi kargak arazoak eman ditzakete
`file://` protokoloarekin nabigatzaile batzuetan). Adibidez:

```bash
# Python 3 dutenentzat
cd akerra-jokoa
python3 -m http.server 8000

# edo Node.js dutenentzat
npx serve .
```

Ondoren ireki `http://localhost:8000` nabigatzailean.

## Doitu konfigurazioa

`game.js` fitxategiaren goialdean dagoen `CONFIG` objektuan alda daitezke:

- `DURATION`: partidaren iraupena segundotan (25 lehenetsita).
- `SPEED_INITIAL` / `SPEED_MAX`: abiadura hasieran eta gehienez.
- `GRAVITY` / `JUMP_FORCE`: jauziaren fisika.
- `SHOP_URL`: "DENDARA JOAN" botoiak irekitzen duen esteka.
- `PRIZES`: sarien zerrenda pisu bakoitzarekin (portzentajezko probabilitatea).

## Argitaratu doan

### Netlify

1. Sortu kontu bat [netlify.com](https://www.netlify.com)-en (doakoa).
2. "Add new site" → "Deploy manually" eta arrastatu proiektuaren karpeta
   osoa (edo konektatu GitHub errepositorioa "Import from Git" bidez).
3. Build command hutsik utzi eta publish directory gisa `/` (erroa) jarri,
   proiektuak build-rik behar ez duelako.
4. Minutu gutxira URL publiko bat izango duzu jokoa probatzeko.

### GitHub Pages

1. Igo proiektua GitHub errepositorio batera (`git init`, `git add .`,
   `git commit`, `git push`).
2. Errepositorioan joan **Settings → Pages**-era.
3. "Source" atalean aukeratu adarra (`main` adibidez) eta karpeta `/ (root)`.
4. Gorde eta minutu batzuk itxaron; URL-a
   `https://<erabiltzailea>.github.io/<errepositorioa>/` izango da.

Bi kasuetan ez da ezer konfiguratu behar gehiago: proiektua estatikoa da
erabat (HTML/CSS/JS + irudiak), beraz doako edozein ostalaritza estatikok
balio du.
