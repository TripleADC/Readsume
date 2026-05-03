import { Component,signal, inject } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LoginService } from './service/login.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected readonly title = signal('Readsume');
  protected readonly window = window;
  protected auth = inject(AuthService);

  // Services
  private loginService = inject(LoginService);

  constructor(private router : Router){};

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((loggedIn) => {
      if (loggedIn) {
        this.login();
      }
    });
  }

  login()
  {
    this.loginService.login()
      .subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err);
        }
      }
    )
  }
}
