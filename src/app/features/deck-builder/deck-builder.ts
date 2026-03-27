import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DeckCard {
  id: string;
  name: string;
  image: string;
  mana_cost: string;
  type: string;
  count: number;
}

@Component({
  selector: 'app-deck-builder',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './deck-builder.html',
  styleUrl: './deck-builder.css'
})
export class DeckBuilder {
  deckName = 'Új Pakli';
  deckCards: DeckCard[] = [];

  // Kereséshez szükséges változók
  searchQuery = '';
  selectedColors: string[] = [];
  searchResults: any[] = [];
  isSearching = false;

  // Ez a függvény szedi szét a {W}{2} formátumot egy listává, amit az HTML megért
  parseMana(manaCost: string): string[] {
    if (!manaCost) return [];

    // Regex-szel kikeressük a kapcsos zárójelek közötti részeket
    const matches = manaCost.match(/\{([^}]+)\}/g);
    if (!matches) return [];

    // Eltávolítjuk a zárójeleket és a slash-t (pl. {G/W} -> GW), mert az API így kéri az SVG-t
    return matches.map(symbol =>
      symbol.replace('{', '').replace('}', '').replace('/', '')
    );
  }

  get totalCards(): number {
    return this.deckCards.reduce((sum, card) => sum + card.count, 0);
  }

  // Színválasztó logika
  toggleColor(color: string) {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push(color);
    }
    this.searchCards();
  }

  async searchCards() {
    if (!this.searchQuery.trim() && this.selectedColors.length === 0) return;

    this.isSearching = true;
    let fullQuery = this.searchQuery;
    if (this.selectedColors.length > 0) {
      fullQuery += ` c:${this.selectedColors.join('')}`;
    }

    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(fullQuery)}`);
      const data = await response.json();
      this.searchResults = data.data || [];
    } catch (error) {
      console.error('Hiba:', error);
    } finally {
      this.isSearching = false;
    }
  }

  // Itt volt a hiba a képen! Megfelelően átadjuk a 'card' paramétert
  addToDeckFromSearch(card: any) {
    const existingCard = this.deckCards.find(c => c.id === card.id);
    if (existingCard) {
      this.addCard(existingCard);
    } else {
      this.deckCards.push({
        id: card.id,
        name: card.name,
        image: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
        mana_cost: card.mana_cost || '',
        type: card.type_line, // Így már látni fogja, mert a card a függvény paramétere
        count: 1
      });
    }
  }

  addCard(card: DeckCard) {
    if (card.count < 4 || card.type.includes('Basic Land')) {
      card.count++;
    }
  }

  removeCard(index: number) {
    if (this.deckCards[index].count > 1) {
      this.deckCards[index].count--;
    } else {
      this.deckCards.splice(index, 1);
    }
  }

  saveDeck() {
    alert('A mentéshez be kell kötnünk a Firebase-t!');
  }
}

