import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'; // Ez kell a Vissza gombhoz
import { ScryfallService } from '../../core/services/scryfall';
import { MagicCard } from '../../core/models/card';
import { ManaPipe } from '../../shared/pipes/mana.pipe';

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [ManaPipe],
  templateUrl: './card-details.html',
  styleUrl: './card-details.css'
})
export class CardDetails implements OnInit {
  card: MagicCard | null = null;
  selectedFaceIndex: number = 0;

  selectFace(index: number) {
    this.selectedFaceIndex = index;
  }

  private route = inject(ActivatedRoute);
  private scryfallService = inject(ScryfallService);
  private location = inject(Location);

  ngOnInit() {
    // Kiolvassuk az ID-t a webcímből (URL)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.scryfallService.getCardById(id).subscribe({
        next: (adat) => this.card = adat,
        error: (hiba) => console.error('Nem található a kártya', hiba)
      });
    }
  }

  // Vissza a kereséshez (hogy ne vesszen el a beírt keresőszó)
  goBack() {
    this.location.back();
  }
}
