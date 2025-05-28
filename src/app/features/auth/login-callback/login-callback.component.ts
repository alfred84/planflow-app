import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login-callback',
  template: `<p>Autenticando...</p>`
})
export class LoginCallbackComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('token');

    console.log(token);

    if (token) {
      localStorage.setItem('trello_token', token);
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}