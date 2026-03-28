import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Component, ChangeDetectorRef, HostListener } from '@angular/core';

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

  // Tooltip változók a kép megjelenítéséhez
  hoveredCardImage: string | null = null;
  tooltipX = 0;
  tooltipY = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  // Egér mozgásának követése a kép megjelenítéséhez
  @HostListener('document:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent) {
    if (!this.hoveredCardImage) return;

    const offset = 20;
    let posX = event.clientX + offset;
    let posY = event.clientY + offset;

    // Edge detection: Ne lógjon ki a kép a képernyő szélén
    if (posX + 250 > window.innerWidth) {
      posX = event.clientX - 270;
    }
    if (posY + 350 > window.innerHeight) {
      posY = event.clientY - 370;
    }

    this.tooltipX = posX;
    this.tooltipY = posY;
  }

  onMouseEnterCard(image: string) {
    this.hoveredCardImage = image;
  }

  onMouseLeaveCard() {
    this.hoveredCardImage = null;
  }

  // Mana szimbólumok szétszedése képekké
  parseMana(manaCost: string): string[] {
    if (!manaCost) return [];
    const matches = manaCost.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return matches.map(symbol =>
      symbol.replace('{', '').replace('}', '').replace('/', '')
    );
  }

  get totalCards(): number {
    return this.deckCards.reduce((sum, card) => sum + card.count, 0);
  }

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
      this.cdr.detectChanges();
    }
  }

  addToDeckFromSearch(card: any) {
    const existingCard = this.deckCards.find(c => c.id === card.id);
    if (existingCard) {
      this.addCard(existingCard);
    } else {
      // JAVÍTÁS: Ha nincs mana_cost a fő objektumban, vesszük az első oldalét (card_faces)
      const mana = card.mana_cost || (card.card_faces ? card.card_faces[0].mana_cost : '');
      const img = card.image_uris?.normal || (card.card_faces ? card.card_faces[0].image_uris?.normal : '');
      const type = card.type_line || (card.card_faces ? card.card_faces[0].type_line : '');

      this.deckCards.push({
        id: card.id,
        name: card.name,
        image: img,
        mana_cost: mana,
        type: type,
        count: 1
      });
    }
    this.cdr.detectChanges();
  }

  addCard(card: DeckCard) {
    if (card.count < 4 || card.type.includes('Basic Land')) {
      card.count++;
      this.cdr.detectChanges();
    }
  }

  removeCard(index: number) {
    if (this.deckCards[index].count > 1) {
      this.deckCards[index].count--;
    } else {
      this.deckCards.splice(index, 1);
    }
    this.cdr.detectChanges();
  }

  saveDeck() {
    alert('A mentéshez be kell kötnünk a Firebase-t!');
  }
}
