# AKERRA JOKOA — Baliabideak (assets)

Fitxategi guztiak placeholder gisa sortuta daude (kolore-laukiak izenarekin),
jokoa hasieratik funtzionatzeko. Ordezkatu bakoitza azken irudiarekin
**izen bera eta kokapen bera** mantenduz, eta jokoak automatikoki erabiliko
ditu berriak. Ez dago kodean ezer aldatu beharrik.

**Jokoak irudi bakoitzaren benetako proportzioa errespetatzen du** (ez du
inoiz distortsionatzen edo tolesten): kanpoan zehaztutako **altuera** batera
eskalatzen du irudi bakoitza, eta zabalera irudiaren proportzio errealetik
kalkulatzen da automatikoki. Beraz beheko taulako "Neurria" zutabea
**erreferentzia** bat da (irudi karratu bat sortzeko, adibidez), baina
igotzen duzun azken irudiak proportzio desberdina badu (adibidez landscape
formatuko marrazki bat, alboetan espazio huts gehiagorekin), jokoak
proportzio hori bere horretan errespetatuko du eta ez du karratu edo
bertikal behartuko. Salbuespen bakarra `/player` da: korrika-animazioko 6
frameek, jauziak eta irabazteak **tamaina eta proportzio bera** eduki behar
dute elkarren artean, bestela pertsonaia jauzi/dardara egingo baitu frame
batetik bestera aldatzean.

## /backgrounds

Hauek dira salbuespena: ez dira altuera batera eskalatzen, pantaila osoa
betetzen dute beti (canvas-aren zabalera osoa). Neurria erreferentzia gisa
soilik ematen da.

| Fitxategia | Neurria erref. (px) | Fondo gardena? |
|---|---|---|
| `bg_forest.png` | 1280×720 | Ez (opakua). Basoko eszena osoa, atzeko plano finko gisa marrazten da (ez da errepikatzen/tiling). |
| `ground.png` | 1280×220 | Ez (opakua). Lurzoruaren zerrenda, ezkerretik eskuinera errepikagarria (seamless hobe). |
| `door_bg.png` | 1280×720 | Ez (opakua). Sarien pantailako atzeko planoa (ate magikoa / basoko leizea). |

## /player

Pertsonaia beti %33-an kokatzen da ezkerretik. **Altuera helburua: ~160px**
(zabalera automatikoki kalkulatzen da irudiaren proportziotik). Sprite
guztiek **tamaina eta proportzio bera** izan behar dute elkarren artean
(guztiak 120×160 placeholder-etan, adibidez), bestela korrika-animazioak
dardara egingo baitu frame batetik bestera.

| Fitxategia | Neurria erref. (px) | Fondo gardena? |
|---|---|---|
| `player_run_1.png` … `player_run_6.png` | 120×160 | Bai. Korrika animazioaren 6 frame (12 fps-ra erreproduzitzen dira). |
| `player_jump.png` | 120×160 | Bai. Jauzian dagoenean erakusten den irudia. |
| `player_win.png` | 120×160 | Bai. Harria/eguzkilorea lortzean erakusten den irudia (irabazi-posea). |

## /enemies

**Altuera helburua: ~170px** (zabalera automatikoki kalkulatzen da
irudiaren proportziotik — marrazkiak espazio huts gehiago badu alboetan,
zabalago agertuko da, distortsionatu gabe).

| Fitxategia | Neurria erref. (px) | Fondo gardena? |
|---|---|---|
| `witch.png` | 150×170 | Bai. Sorgina, pantailaren ezkerreko ertzean hegan (goran-beheran higidura leunarekin, beheko %35a gardenagoa). |

## /obstacles

Hitbox-a sprite-aren %70ekoa da, beraz marjina txiki bat utzi irudian
kalte egiten ez duen eremu batekin. **Altuera helburuak** (zabalera
proportziotik kalkulatzen da):

| Fitxategia | Altuera helburua (px) | Neurria erref. (px) | Fondo gardena? |
|---|---|---|---|
| `root_1.png` | 60 | 60×60 | Bai. Oztopo txikia. |
| `root_2.png` | 70 | 80×70 | Bai. Oztopo ertaina. |
| `root_3.png` | 80 | 100×80 | Bai. Oztopo handia. |

## /items

| Fitxategia | Altuera helburua (px) | Neurria erref. (px) | Fondo gardena? |
|---|---|---|---|
| `eguzkilore.png` | ~90 (sarien pantailan) / ~70 (irabazte-halo-an) | 90×90 (karratu antzekoa gomendatua) | Bai. Progresio-barraren amaieran eta sarien pantailan erabiltzen da (3 kopia). |
| `stone.png` | 110 | 130×110 | Bai. Denbora amaitzean eskuinetik agertzen den harria, eguzkilorea gainean duena. |

## /ui

Logoa CSS bidez erakusten da (biribila, `object-fit: cover`), beraz
zabalera/altuera proportzio ezberdinak ondo moztuko dira zirkulu barruan.

| Fitxategia | Neurria erref. (px) | Fondo gardena? |
|---|---|---|
| `logo.png` | 320×320 (karratua gomendatua) | Bai. AKERRA markaren logoa, hasierako pantailan agertzen dena. |

## /sounds (aukerakoak)

Jokoa **audiorik gabe ere ondo funtzionatzen du**. Fitxategiak falta badira,
soinurik gabe jarraituko du arazorik gabe. Gehitu nahi izanez gero, jarri
fitxategi hauek izen berdinarekin:

| Fitxategia | Deskribapena |
|---|---|
| `jump.mp3` | Jauzi laburra egiterakoan. |
| `hit.mp3` | Sorginak harrapatzean (talka). |
| `win.mp3` | Denbora amaitu eta saria irabaztean. |
| `music.mp3` | Atzeko musika, loop-ean, erabiltzailearen lehen interakzioaren ondoren hasten dena. |

## Oharrak

- Formatu guztiak **PNG** dira (gardentasuna behar dutenak PNG-32 alpha
  kanalarekin).
- Irudi bat falta bada edo kargatzean huts egiten badu, jokoak kolore
  lauko laukizuzena erakutsiko du haren ordez, apurtu gabe jarraitzeko.
- Estilo koherentea gomendatzen da irudi guztien artean (paleta bera,
  lerro-lodiera antzekoa, itzal-estilo bera) emaitza bisual uniforme
  baterako.
