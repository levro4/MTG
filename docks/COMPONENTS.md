# 🧩 MTG App - Komponens Architektúra (COMPONENTS.md)

Ez a dokumentum az MTG App (Magic: The Gathering Pakliépítő) Angular 17+ (standalone) komponenseinek hierarchiáját és az oldalakhoz való kapcsolódásukat mutatja be.

---

## 1. Komponensfa

Az alkalmazás gyökér komponenséből kiindulva így épül fel a felület. Az adatfolyam ezen a fán keresztül áramlik.

    AppComponent (Gyökér komponens)
     │
     ├── NavbarComponent (Globális navigáció és Hamburger menü)
     │
     ├── RouterOutlet (Dinamikusan betöltődő nézetek)
     │    │
     │    ├── HomeComponent (Kezdőlap)
     │    │
     │    ├── SearchComponent (Kártyakereső oldal)
     │    │    ├── FilterBarComponent (Keresőmező és színszűrők)
     │    │    └── CardGridComponent (Rácsos elrendezés a találatoknak)
     │    │         └── CardItemComponent (Egy kártya mini nézete / hover effektek)
     │    │
     │    ├── CardDetailsComponent (Kártya részletek oldal)
     │    │    └── CardFacesComponent (Kétoldalú kártyák kezelése)
     │    │
     │    ├── DeckBuilderComponent (Pakliépítő oldal)
     │    │    ├── QuickSearchComponent (Vízszintes gyorskereső)
     │    │    │    └── MiniCardComponent (Keresési találat kártya)
     │    │    ├── DeckListComponent (Pakli táblázat, + / - gombok, linkek)
     │    │    │    └── TooltipComponent (Dinamikus egérkövető képelejáró)
     │    │    └── DeckStatsComponent (Pakli statisztikák, tippek doboz)
     │    │
     │    ├── ProfileComponent (Felhasználói fiók és Dashboard)
     │    │    ├── DeckFoldersComponent (Pakli mappák listája)
     │    │    ├── MatchHistoryComponent (Meccs eredmények és statisztikák)
     │    │    └── FavoritesComponent (Kedvencelt kártyák listája)
     │    │
     │    └── AuthComponent (Regisztráció és Bejelentkezés)
     │
     └── ToastComponent (Globális visszajelzések, pl. "Pakli elmentve")

---

## 2. Modulok / Oldalak

Az alábbi táblázat bemutatja a fő oldalakat (Route-okat), és azokat a komponenseket, amelyek az adott oldal felépítéséért felelnek.

| Oldal (Route) | Fő Komponens | Alárendelt Komponensek | Leírás |
| :--- | :--- | :--- | :--- |
| **Kezdőlap** <br> (`/`) | `HomeComponent` | Nincsenek alkategóriák | Landing page, figyelemfelkeltő animációkkal és navigációs hívószavakkal. |
| **Kártyakereső** <br> (`/search`) | `SearchComponent` | `FilterBarComponent`<br>`CardGridComponent`<br>`CardItemComponent` | A Scryfall API-n keresztüli keresésért felelős modul. A *Search* tartja az állapotot, a *Grid* és az *Item* pedig megjelenít. |
| **Kártya Részletek** <br> (`/card/:id`) | `CardDetailsComponent` | `CardFacesComponent` (kétoldalú lapokhoz) | Egyetlen kártya adatainak, szabályszövegének és árának részletes megjelenítése. Dinamikus mana ikon generálás. |
| **Pakliépítő** <br> (`/deck-builder`) | `DeckBuilderComponent` | `QuickSearchComponent`<br>`MiniCardComponent`<br>`DeckListComponent`<br>`DeckStatsComponent`<br>`TooltipComponent` | A legkomplexebb oldal. Kezeli a 60 kártyás limitet, a 4-es példányszám szabályokat, és integrálja a gyorskeresőt a táblázatos paklilistával. |
| **Profil / Dashboard** <br> (`/profile`) | `ProfileComponent` | `DeckFoldersComponent`<br>`MatchHistoryComponent`<br>`FavoritesComponent` | Autentikált oldal. Itt kezelheti a felhasználó a paklijait, a mappáit, a meccs-statisztikáit és a könyvjelzőzött (kedvenc) kártyáit. |
| **Autentikáció** <br> (`/auth`) | `AuthComponent` | Nincs külön | A Firebase Auth segítségével a belépésért és regisztrációért felelős oldal. |
| **Globális elemek** <br> *(Mindenhol jelen van)* | `AppComponent` | `NavbarComponent`<br>`ToastComponent` | A ragadós fejléc (Hamburger menüvel), a routing csatorna és a globális értesítési rendszer. |
