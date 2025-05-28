import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule],
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
