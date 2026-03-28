# 🗄️ MTG App - Adatmodell (DATAMODEL.md)

Ez a dokumentum az MTG App (Magic: The Gathering Pakliépítő) adatbázis-struktúráját mutatja be. Az alkalmazás backendjeként **Firebase Cloud Firestore (NoSQL)** adatbázist használunk.

A kártyák nyers adatait (szabályszöveg, mana költség, képek) a hivatalos **Scryfall API** szolgáltatja, így az adatbázisunkban csak a felhasználókhoz köthető személyes adatokat, paklikat és statisztikákat tároljuk.

---

## 1. Entitások és Mezők

Az adatbázisunk az alábbi 5 fő kollekcióból (entitásból) épül fel.

### 1.1 `User` (Felhasználó)
A Firebase Authentication által kezelt felhasználó profiladatai és beállításai.

| Mezőnév | Típus | Leírás |
| :--- | :--- | :--- |
| `uid` | `string` | Elsődleges kulcs (Firebase Auth UID) |
| `email` | `string` | A felhasználó e-mail címe |
| `preferences` | `object` | Felhasználói beállítások (pl. `{ theme: 'dark', defaultFormat: 'commander' }`) |
| `createdAt` | `timestamp` | Regisztráció pontos ideje |

### 1.2 `Folder` (Mappa)
A felhasználó paklijainak rendszerezésére szolgáló kategóriák (pl. "Verseny paklik", "Commander").

| Mezőnév | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | `string` | Elsődleges kulcs (Auto-generált) |
| `userId` | `string` | Idegen kulcs -> `User.uid` (A mappa tulajdonosa) |
| `name` | `string` | A mappa neve (pl. "Modern") |
| `color` | `string` | HEX színkód a UI megjelenítéshez (pl. "#e74c3c") |
| `createdAt` | `timestamp` | Létrehozás ideje |

### 1.3 `Deck` (Pakli)
A felhasználó által összeállított MTG pakli. A kártyákat a gyorsabb olvasás érdekében beágyazott tömbként tároljuk.

| Mezőnév | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | `string` | Elsődleges kulcs (Auto-generált) |
| `userId` | `string` | Idegen kulcs -> `User.uid` (A pakli tulajdonosa) |
| `folderId` | `string | null` | Idegen kulcs -> `Folder.id` (Melyik mappában van, ha van) |
| `name` | `string` | A pakli neve |
| `totalCards`| `number` | A pakliban lévő lapok száma (összesen) |
| `cards` | `array<object>` | Beágyazott kártya objektumok listája. Objektum: `{ scryfallId: string, name: string, imageUrl: string, mana_cost: string, type: string, count: number }` |
| `createdAt` | `timestamp` | Létrehozás ideje |
| `updatedAt` | `timestamp` | Utolsó módosítás ideje |

### 1.4 `FavoriteCard` (Kedvenc Kártya)
A felhasználó által könyvjelzőzött, gyorsan elérni kívánt lapok listája.

| Mezőnév | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | `string` | Elsődleges kulcs (Auto-generált) |
| `userId` | `string` | Idegen kulcs -> `User.uid` |
| `scryfallId`| `string` | A kártya hivatalos Scryfall azonosítója |
| `name` | `string` | A kártya neve (denormalizált a gyors megjelenítésért) |
| `imageUrl` | `string` | A kártya képének URL-je |
| `notes` | `string` | A felhasználó saját megjegyzése a laphoz |
| `addedAt` | `timestamp` | Hozzáadás ideje |

### 1.5 `MatchRecord` (Meccs Eredmény)
Egy adott paklival játszott meccs eredménye a Win/Loss arány méréséhez.

| Mezőnév | Típus | Leírás |
| :--- | :--- | :--- |
| `id` | `string` | Elsődleges kulcs (Auto-generált) |
| `userId` | `string` | Idegen kulcs -> `User.uid` |
| `deckId` | `string` | Idegen kulcs -> `Deck.id` (Melyik saját paklival játszott) |
| `opponentDeck`| `string` | Az ellenfél paklijának típusa (pl. "Mono Red Aggro") |
| `result` | `enum` | A meccs kimenetele: `'win'`, `'loss'`, vagy `'draw'` |
| `notes` | `string` | Opcionális megjegyzés a meccsről |
| `playedAt` | `timestamp` | A meccs időpontja |

---

## 2. Kapcsolatok (Relációk)

Bár a Firestore egy NoSQL adatbázis, az adatok logikailag szorosan kapcsolódnak egymáshoz (referenciák és denormalizáció révén).

Az alábbi táblázat bemutatja az entitások közötti logikai relációkat:

| Kapcsolat | Típus | NoSQL Megvalósítás | Leírás |
| :--- | :--- | :--- | :--- |
| **User → Folder** | `1:N` | Referencia (`userId`) | Egy felhasználó több mappát is létrehozhat, de egy mappa pontosan egy felhasználóhoz tartozik. |
| **User → Deck** | `1:N` | Referencia (`userId`) | Egy felhasználónak több paklija lehet. Szigorú biztonsági szabály védi (Security Rule), hogy mindenki csak a sajátját lássa. |
| **Folder → Deck** | `1:N` | Referencia (`folderId`) | Egy mappában több pakli is lehet, de egy pakli egyszerre legfeljebb egy mappához tartozhat (vagy a gyökérkönyvtárban van, ekkor `null`). |
| **User → FavoriteCard** | `1:N` | Referencia (`userId`) | Egy felhasználó több tucat kártyát is a kedvencei közé tehet. |
| **Deck → MatchRecord** | `1:N` | Referencia (`deckId`) | Egy adott paklihoz több meccs-statisztika rögzíthető. (Ezen keresztül a User-hez is kapcsolódik `userId` alapján). |
| **Deck ↔ Card** | `N:M` | Beágyazás (Embedded Array) | Egy pakliban sok kártya van, és egy kártya sok pakliban szerepelhet. Firestore-ban ezt nem kapcsolótáblával oldjuk meg, hanem a `Deck` dokumentumon belül egy `cards` tömbben **beágyazva** tároljuk a legfontosabb kártyaadatokat, minimalizálva az adatbázis olvasások számát. |
