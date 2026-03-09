import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScryfallService } from '../../core/services/scryfall';
import { MagicCard } from '../../core/models/card';
import { ManaPipe } from '../../shared/pipes/mana.pipe';

@Component({
  selector: 'app-card-search',
  standalone: true,
  imports: [FormsModule, RouterLink, ManaPipe],
  templateUrl: './card-search.html',
  styleUrl: './card-search.css'
})
export class CardSearch implements OnInit {
  // A három beviteli mezőnk adatai
  searchName: string = '';
  searchColor: string = '';
  searchMana: string = '';

  manaColors = [
    { value: '', label: 'Mind' }, // Ez lesz a "Bármilyen szín" gomb
    { value: 'w', symbol: '{W}' },
    { value: 'u', symbol: '{U}' },
    { value: 'b', symbol: '{B}' },
    { value: 'r', symbol: '{R}' },
    { value: 'g', symbol: '{G}' },
    { value: 'c', symbol: '{C}' }
  ];

  setColor(colorValue: string) {
    this.searchColor = colorValue;
  }

  cards: MagicCard[] = [];
  private scryfallService = inject(ScryfallService);

  ngOnInit() {
    // Visszatöltjük az összes beállítást a memóriából
    this.searchName = this.scryfallService.lastSearchName;
    this.searchColor = this.scryfallService.lastSearchColor;
    this.searchMana = this.scryfallService.lastSearchMana;
    this.cards = this.scryfallService.lastSearchResults;
  }

  search() {
    // 1. Összerakjuk a Scryfall "kódot" a kitöltött mezőkből
    let queryParts = [];

    if (this.searchName.trim()) {
      queryParts.push(this.searchName.trim());
    }
    if (this.searchColor) {
      queryParts.push(`c:${this.searchColor}`); // pl. c:red
    }
    if (this.searchMana) {
      queryParts.push(`mv=${this.searchMana}`); // pl. mv=3
    }

    // Szóközzel elválasztva összekötjük őket (pl. "Avacyn c:white mv=8")
    const finalQuery = queryParts.join(' ');

    // Ha teljesen üres minden, nem keresünk
    if (!finalQuery) return;

    // 2. Elmentjük a memóriába az aktuális beállításokat
    this.scryfallService.lastSearchName = this.searchName;
    this.scryfallService.lastSearchColor = this.searchColor;
    this.scryfallService.lastSearchMana = this.searchMana;

    // 3. Mehet a keresés az API felé!
    this.scryfallService.searchCards(finalQuery).subscribe({
      next: (results) => {
        this.cards = results;
        this.scryfallService.lastSearchResults = results;
      },
      error: (err) => {
        console.error('Hiba történt:', err);
        this.cards = [];
        this.scryfallService.lastSearchResults = [];
      }
    });
  }
}
