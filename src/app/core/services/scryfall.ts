import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MagicCard } from '../models/card';

@Injectable({
  providedIn: 'root'
})
export class ScryfallService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.scryfall.com';

  public lastSearchName: string = '';
  public lastSearchColor: string = '';
  public lastSearchMana: string = '';
  public lastSearchResults: MagicCard[] = [];
  public homeRandomCards: any[] = [];

  // Keresés kártyanév alapján (pl. "Black Lotus")
  searchCards(query: string): Observable<MagicCard[]> {
    return this.http.get<any>(`${this.apiUrl}/cards/search?q=${query}`).pipe(
      map(response => response.data) // A Scryfall a kártyákat egy "data" tömbbe csomagolva küldi, ezt hámozzuk ki
    );
  }
  // Lekér egyetlen kártyát az ID-ja alapján
  getCardById(id: string): Observable<MagicCard> {
    return this.http.get<MagicCard>(`${this.apiUrl}/cards/${id}`);
  }
}
