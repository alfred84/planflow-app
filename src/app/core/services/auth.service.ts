import { inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; 
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private platformId = inject(PLATFORM_ID);

  constructor() { }

  loginWithTrello(apiKey: string): void {
    // Guardar la API Key en localStorage (opcional, según tu flujo)  
    localStorage.setItem('trello_api_key', apiKey);
    const key = environment.trelloKey;
    const redirect = environment.trelloRedirectUrl;
    const name = environment.trelloAppName;

    window.location.href = `https://trello.com/1/authorize?expiration=never&name=${name}&scope=read,write&response_type=token&key=${key}&return_url=${redirect}`;
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('trello_token');
      return !!token;
    }
    return false;
  }
}
