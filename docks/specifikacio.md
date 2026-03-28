# 🪄 MTG App
**Magic: The Gathering Pakliépítő alkalmazás**
Funkcionalitási Specifikáció — v2

Technológia: Angular 17+  |  Firebase / Firestore
Dátum: 2026. március

---

## 1. Áttekintés

### 1.1 Az alkalmazás célja
A felhasználó a hivatalos Scryfall API segítségével valós időben böngészhet Magic: The Gathering kártyákat, saját paklikat állíthat össze és menthet el a felhőbe. Az alkalmazás responsive, modern, animációkkal gazdagított Angular webalkalmazásként működik, Firebase backend-del támogatva. Minden pakli szigorúan privát, csak a létrehozója férhet hozzá.

### 1.2 Technológiai stack

| Réteg | Technológia |
| :--- | :--- |
| **Frontend** | Angular 17+ (standalone components) |
| **Nyelv** | TypeScript (strict mode) |
| **Styling** | SCSS / tiszta CSS3 (flexbox, CSS grid, animációk) |
| **Routing** | Angular Router |
| **Backend** | Google Cloud Firebase |
| **Adatbázis**| Cloud Firestore (NoSQL) |
| **Autentikáció** | Firebase Authentication (email/jelszó) |
| **Külső API** | Scryfall API (kártyaadatok és képek lekérése) |
| **Verziókezelés** | Git + GitHub |

### 1.3 A 4 fő modul
1. **Kártyakereső Katalógus** — kártyák valós idejű keresése, böngészése.
2. **Kártya Részletek** — egyedi kártyanézet, szabályszöveggel és dinamikus mana ikonokkal.
3. **Pakliépítő (Deck Builder)** — horizontális gyorskereső, lista nézet, paklik összeállítása és vázlatok mentése.
4. **Felhasználói Profil & Statisztikák** — auth, profil, mappák kezelése és meccs-statisztikák.

---

## 2. Fejlesztési Térkép
Az alábbi táblázat mutatja a projekt moduljainak felépítési sorrendjét.

| Fázis | Téma | Amit építünk |
| :--- | :--- | :--- |
| **1.** | UX, UI Design & Responsive Layout | Navigációs sáv, Hamburger menü, Kezdőlap animációk (kártyalegyező). |
| **2.** | Külső API Integráció | Scryfall API bekötése, keresőmező, kártya grid layout. |
| **3.** | Architekturá & Navigáció | Dinamikus routing (`/card/:id`), részletes oldal, kétoldalú kártyák kezelése. |
| **4.** | UI Interakciók & Accessibility | Lebegő kártyakép (tooltip), animált linkek, mana ikon generátor. |
| **5.** | Állapotkezelés & Reaktivitás | Pakliépítő logika (4-es kártyalimit, darabszámok, lista kezelése). |
| **6.** | Security, Authentication & Permissions | Firebase Auth, Regisztráció/Bejelentkezés, Route guards. |
| **7.** | Backend integráció & Services | Firestore CRUD 5 entitásra (User, Deck, Folder, Favorites, Matches). |

---

## 3. Entitások és adatmodell

A Firestore NoSQL dokumentum-adatbázis, ezért a relációs modellt dokumentum-struktúrára képezzük le. A kártyák nyers adatai a Scryfall API-ból származnak, az adatbázisban a felhasználók személyes adatait, paklijait és preferenciáit tároljuk.

### 3.1 Az 5 fő entitás és CRUD műveleteik

| # | Entitás | Create | Read | Update | Delete |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **User** (Felhasználó) | Regisztráció | Profil megtekintés | Jelszó/Email csere | Fiók törlése |
| 2 | **Deck** (Pakli) | Új pakli mentése | Saját paklik listázása | Pakli szerkesztése | Pakli törlése |
| 3 | **Folder** (Mappa) | Új mappa (pl. "Commander") | Mappák listázása | Név/Szín módosítása | Mappa törlése |
| 4 | **FavoriteCard** (Kedvenc) | Kártya kedvencekhez adása | Kedvencek böngészése | Megjegyzés írása a laphoz | Kedvenc eltávolítása |
| 5 | **MatchRecord** (Meccs) | Eredmény rögzítése (Win/Loss) | Statisztika/Történet nézet | Eredmény korrigálása | Meccs log törlése |

### 3.2 Firestore kollekciók szerkezete

**1. `users` kollekció**
* `uid`: string — Firebase Auth uid
* `email`: string
* `createdAt`: Timestamp
* `preferences`: object (pl. alapértelmezett kártya nyelv vagy sötét/világos téma)

**2. `folders` kollekció** (Paklik rendszerezéséhez)
* `id`: string
* `userId`: string (Tulajdonos)
* `name`: string (Pl. "Verseny paklik")
* `color`: string (UI színkód a mappához)
* `createdAt`: Timestamp

**3. `decks` kollekció**
* `id`: string
* `userId`: string
* `folderId`: string | null (Kapcsolat a mappához)
* `name`: string
* `totalCards`: number (Mentés lehetséges vázlatként is, ha < 60)
* `cards`: beágyazott tömb `{ scryfallId, name, imageUrl, mana_cost, type, count }`
* `createdAt`, `updatedAt`: Timestamp

**4. `favoriteCards` kollekció** (Gyorsan elérhető, fontos kártyák)
* `id`: string
* `userId`: string
* `scryfallId`: string (Hivatkozás a Scryfall API-ra)
* `name`: string
* `imageUrl`: string
* `notes`: string (Saját megjegyzés a kártyához)
* `addedAt`: Timestamp

**5. `matchRecords` kollekció** (Win/Loss arány követése)
* `id`: string
* `userId`: string
* `deckId`: string (Melyik paklival játszott a user)
* `opponentDeck`: string (Pl. "Mono Red Aggro")
* `result`: 'win' | 'loss' | 'draw'
* `notes`: string (Miért nyert/vesztett)
* `playedAt`: Timestamp

---

## 4. Fő modulok részletesen

### 4.1 Kártyakereső Katalógus
* Valós idejű keresés a Scryfall API-n keresztül.
* **Kártya grid:** Responsive grid: 1 oszlop (mobile) → 2 oszlop (tablet) → több oszlop (desktop).
* **Kedvencelés:** Szív ikon a kártyákon, amivel egy kattintással a `favoriteCards` kollekcióba menthető.

### 4.2 Kártya Részletes Nézete
* Külön oldalra navigál: `/card/:id`.
* **Kétoldalú kártyák kezelése (Modal DFC):** Ha a kártyának két oldala van, a UI megjeleníti mindkettőt (kattintható arcok).
* Automatikus mana-szimbólum generálás a szabályszövegben és a fejlécben is (Fallback logika a dupla oldalú kártyákhoz).

### 4.3 Pakliépítő (Deck Builder)
* **Gyorskereső:** Az oldal tetején vízszintesen görgethető kereső eredmények. Színszűrők (W, U, B, R, G, C) Magic ikonokkal.
* **Pakli lista (Táblázat):** Név, Mana költség (ikonokkal), Darabszám (+ / - gombok).
* **Üzleti logika (Szabályok):**
  * **4-es limit:** A "+" gomb automatikusan letilt, ha a kártyából már 4 darab van a pakliban (kivéve "Basic Land").
  * **Vázlatok mentése:** A "Pakli mentése" gomb aktív marad < 60 kártya esetén is.
* **Interaktív UX:**
  * Kártya nevére húzva az egeret: piros animált aláhúzás.
  * *Tooltip (Képelejáró)*: A kártya képe dinamikusan követi az egeret a táblázat felett, edge-detection védelemmel.

### 4.4 Felhasználói Profil, Mappák & Statisztikák
* **Regisztráció & Bejelentkezés:** Email + jelszó alapú (Firebase Auth).
* **Privát adatkör:** Firestore Security Rules garantálják a `request.auth.uid == resource.data.userId` szabályt minden kollekcióra.
* **Dashboard:** A profil oldalon láthatóak a mappák (`folders`), a kedvencek (`favoriteCards`), és a paklik meccs-statisztikái (`matchRecords` aggregálása).

---

## 5. Keresztfunkciós elemek

### 5.1 Navigáció & Layout
* **Fő navigáció:** Kezdőlap | Kártyakereső | Pakliépítő | Profil.
* **Layout shell:** Sticky navbar. Asztali nézetben szétválasztott gombok.
* **Tablet & Mobil nézet:** Összecsúszás-védelem tablet méreten, 768px alatt beúszó Hamburger Menü logó szín-inverzióval.

### 5.2 Visszajelzések & mikro-interakciók
* Loading skeleton a kártyák betöltésekor API hívás alatt.
* Empty state illusztrációk + visszajelzés ("Még nincs kártya a paklidban").
* Gombok és linkek animált aláhúzása (Hover effektusok).

### 5.3 Accessibility & Teljesítmény
* Szemantikus HTML elemek használata, reszponzív, nagy kontrasztú olvashatóság.
* **Debounce:** a keresőmezőn, hogy ne terheljük a Scryfall API-t gépelés közben.
* **Változásérzékelés (ChangeDetectorRef):** manuális kikényszerítése aszinkron API hívások után a villódzásmentes DOM frissítéshez.
