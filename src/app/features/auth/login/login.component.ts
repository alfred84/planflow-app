import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '../../../shared/material-ui';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MATERIAL_MODULES],
  templateUrl: './login.component.html',  
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  authForm: FormGroup;
  isLoading = false;
  hideApiKey = true;
  private _snackBar = inject(MatSnackBar);

  private authSvc = inject(AuthService);

  constructor(
    private fb: FormBuilder,    
  ) {
    this.authForm = this.fb.group({
      apiKey: ['', [Validators.required, Validators.minLength(32)]]
    });
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.isLoading = true;
      const apiKey = this.authForm.value.apiKey;
      
      // Simular llamada a la API
      this.authenticateWithTrello(apiKey);
    } else {
      this.markFormGroupTouched();
    }
  }

  private authenticateWithTrello(apiKey: string) {    

    this.authSvc.loginWithTrello(apiKey);

    // // Aquí iría la lógica real de autenticación con Trello
    // setTimeout(() => {
    //   this.isLoading = false;
      
    //   // Simulamos una respuesta exitosa
      // if (apiKey.length >= 32) {
      //   this._snackBar.open('¡Autenticación exitosa! Sincronizado con Trello', 'Cerrar', {
      //     duration: 3000,
      //     panelClass: ['success-snackbar']
      //   });
        
    //     // Aquí podrías emitir un evento o navegar a otra página
    //     console.log('API Key válida:', apiKey);
    //   } else {
    //     this._snackBar.open('Error: API key inválida', 'Cerrar', {
    //       duration: 3000,
    //       panelClass: ['error-snackbar']
    //     });
    //   }
    // }, 2000);
  }

  private markFormGroupTouched() {
    Object.keys(this.authForm.controls).forEach(key => {
      const control = this.authForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage() {
    const apiKeyControl = this.authForm.get('apiKey');
    
    if (apiKeyControl?.hasError('required')) {
      return 'La API key es requerida';
    }
    
    if (apiKeyControl?.hasError('minlength')) {
      return 'La API key debe tener al menos 32 caracteres';
    }
    
    return '';
  }

  toggleApiKeyVisibility() {
    this.hideApiKey = !this.hideApiKey;
  }
}
