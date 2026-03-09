import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <-- Ezt az 1 sort kell hozzáadni felül

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink], // <-- És ide betenni az array-be!
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar { }
