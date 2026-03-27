import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { CardSearch } from './features/card-search/card-search';
import { CardDetails } from './features/card-details/card-details';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { DeckBuilder } from './features/deck-builder/deck-builder';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'search', component: CardSearch },
  { path: 'card/:id', component: CardDetails },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'deck-builder', component: DeckBuilder },
  { path: '**', redirectTo: '' }
];
