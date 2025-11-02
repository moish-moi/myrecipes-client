import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  register(): void {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'נא למלא את כל השדות';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.register(this.username, this.email, this.password).subscribe({
      next: (response: any) => {
        this.successMessage = 'הרשמה בוצעה בהצלחה! עכשיו התחבר';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'שגיאה בהרשמה';
        this.isLoading = false;
      }
    });
  }
}
