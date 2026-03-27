import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';

  onSubmit() {
    console.log('Bejelentkezési kísérlet:', this.email);
    // Ide fogjuk bekötni a Firebase-t a következő lépésben!
  }
}
