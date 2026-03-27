// 1. LÉPÉS: Beimportáljuk a ChangeDetectorRef-et
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScryfallService } from '../../core/services/scryfall';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  randomCards: any[] = [];
  isLoading = true;

  // IDEIGLENES VÁLTOZÓ: Később a Firebase fogja megmondani, hogy be van-e jelentkezve!
  isLoggedIn = false;

  // 2. LÉPÉS: Bekötjük a Képernyőfrissítőt a konstruktorba
  constructor(
    private scryfallService: ScryfallService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.scryfallService.homeRandomCards && this.scryfallService.homeRandomCards.length > 0) {
      this.randomCards = this.scryfallService.homeRandomCards;
      this.isLoading = false;
    } else {
      let savedCards = null;
      if (typeof window !== 'undefined' && window.sessionStorage) {
        savedCards = sessionStorage.getItem('magicRandomCards');
      }

      if (savedCards) {
        this.randomCards = JSON.parse(savedCards);
        this.scryfallService.homeRandomCards = this.randomCards;
        this.isLoading = false;
      } else {
        if (typeof window !== 'undefined') {
          this.loadRandomCards();
        }
      }
    }
  }

  async loadRandomCards() {
    try {
      this.isLoading = true;
      this.randomCards = [];

      let attempts = 0;
      while (this.randomCards.length < 5 && attempts < 15) {
        attempts++;
        const response = await fetch('https://api.scryfall.com/cards/random', { cache: 'no-store' });

        if (response.ok) {
          const card = await response.json();
          if (card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal) {
            this.randomCards.push(card);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.scryfallService.homeRandomCards = this.randomCards;

      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('magicRandomCards', JSON.stringify(this.randomCards));
      }

      this.isLoading = false;

      // 3. LÉPÉS: A varázsszó! Rászólunk az Angularra, hogy azonnal rajzolja újra a képernyőt!
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Hiba a kártyák lekérésekor:', error);
      this.isLoading = false;
      this.cdr.detectChanges(); // Hiba esetén is frissítjük a képernyőt, hogy eltűnjön a töltés
    }
  }

  getImage(card: any): string {
    return card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
  }
}
