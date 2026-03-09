import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { CardSearch } from './features/card-search/card-search';
import { CardDetails } from './features/card-details/card-details'; // <-- 1. Új import

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'search', component: CardSearch },
  { path: 'card/:id', component: CardDetails }, // <-- 2. Dinamikus útvonal az ID-val
  { path: '**', redirectTo: '' }
];
