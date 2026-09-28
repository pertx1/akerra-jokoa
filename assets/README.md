# AKERRA JOKOA — Baliabideak (assets)

Fitxategi guztiak placeholder gisa sortuta daude (kolore-laukiak izenarekin),
jokoa hasieratik funtzionatzeko. Ordezkatu bakoitza azken irudiarekin
**izen bera eta kokapen bera** mantenduz, eta jokoak automatikoki erabiliko
ditu berriak. Ez dago kodean ezer aldatu beharrik.

Neurriak gomendatuak dira (CSS/Canvas-ek proportzioari egokitzen zaizkio),
baina errespetatzea gomendatzen da distortsiorik ez izateko.

## /backgrounds

| Fitxategia | Neurria (px) | Fondo gardena? |
|---|---|---|
| `bg_forest.png` | 1280×720 | Ez (opakua). Basoko atzeko plano osoa, ezkerretik eskuinera errepikagarria (seamless horizontalki hobe). |
| `ground.png` | 1280×220 | Ez (opakua), baina goiko ertza basoarekin ondo uztartzeko diseinatu. Lurzoruaren zerrenda, ezkerretik eskuinera errepikagarria. |
| `door_bg.png` | 1280×720 | Ez (opakua). Sarien pantailako atzeko planoa (ate magikoa / basoko leizea). |

## /player

Pertsonaia beti 25%-ean kokatzen da ezkerrean, altuera finko batekin
(gutxi gorabehera 160px garaiera bistan). Sprite guztiek tamaina bera izan
behar dute erregistro txukuna izateko.

| Fitxategia | Neurria (px) | Fondo gardena? |
|---|---|---|
| `player_run_1.png` … `player_run_6.png` | 120×160 | Bai. Korrika animazioaren 6 frame (12 fps-ra erreproduzitzen dira). |
| `player_jump.png` | 120×160 | Bai. Jauzian dagoenean erakusten den irudia. |
| `player_win.png` | 120×160 | Bai. Harria/eguzkilorea lortzean erakusten den irudia (irabazi-posea). |

## /enemies

| Fitxategia | Neurria (px) | Fondo gardena? |
|---|---|---|
| `witch.png` | 150×170 | Bai. Sorgina, pantailaren ezkerreko ertzean hegan (goran-beheran higidura leunarekin). |

## /obstacles

Hitbox-a sprite-aren %70ekoa da, beraz marjina txiki bat utzi irudian
kalte egiten ez duen eremu batekin.

| Fitxategia | Neurria (px) | Fondo gardena? |
|---|---|---|
| `root_1.png` | 60×60 | Bai. Oztopo txikia. |
| `root_2.png` | 80×70 | Bai. Oztopo ertaina. |
| `root_3.png` | 100×80 | Bai. Oztopo handia. |

## /items

| Fitxategia | Neurria (px) | Fondo gardena? |
|---|---|---|
| `eguzkilore.png` | 90×90 | Bai. Progresio-barraren amaieran eta sarien pantailan erabiltzen da (3 kopia). |
| `stone.png` | 130×110 | Bai. Denbora amaitzean eskuinetik agertzen den harria, eguzkilorea gainean duena. |

## /ui

| Fitxategia | Neurria (px) | Fondo gardena? |
|---|---|---|
| `logo.png` | 320×320 (karratua) | Bai. AKERRA markaren logoa, hasierako pantailan agertzen dena. |

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
