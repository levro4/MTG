import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'mana',
  standalone: true
})
export class ManaPipe implements PipeTransform {
  // Erre azért van szükség, hogy az Angular megbízzon az általunk generált HTML kódokban
  private sanitizer = inject(DomSanitizer);

  transform(text: string | undefined | null): SafeHtml {
    if (!text) return '';

    // Megkeressük a szövegben az összes { } közötti mintát
    const replacedText = text.replace(/{([^}]+)}/g, (match, symbol) => {
      // Eltüntetjük a / jelet a hibrid manából (pl. W/U -> WU), és nagybetűssé tesszük
      const cleanSymbol = symbol.replace('/', '').toUpperCase();

      // Rámutatunk a Scryfall szerverén lévő pontos képre
      const iconUrl = `https://svgs.scryfall.io/card-symbols/${cleanSymbol}.svg`;

      // Visszaadunk egy pici képet, ami pont úgy fog viselkedni, mint egy betű
      return `<img src="${iconUrl}" alt="${match}" title="${match}" style="height: 1.2em; vertical-align: middle; margin: 0 1px;">`;
    });

    // Szólunk az Angularnak, hogy biztonságos a kód, nyugodtan futtassa le
    return this.sanitizer.bypassSecurityTrustHtml(replacedText);
  }
}
