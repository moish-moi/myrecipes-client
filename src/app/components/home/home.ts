import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
  tags: string;
  preparationTime: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  recipes: Recipe[] = [];
  username: string = '';
  isAddingRecipe: boolean = false;
  newRecipe: Partial<Recipe> = {
    title: '',
    ingredients: '',
    instructions: '',
    tags: '',
    preparationTime: 0
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
    this.getUserInfo();
  }

  getUserInfo(): void {
    const token = this.apiService.getToken();
    if (token) {
      // Decode JWT to get username (simplified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload.sub || 'משתמש';
      } catch (e) {
        this.username = 'משתמש';
      }
    }
  }

  loadRecipes(): void {
    this.apiService.getMyRecipes().subscribe({
      next: (recipes: Recipe[]) => {
        this.recipes = recipes;
      },
      error: (err: any) => {
        console.error('שגיאה בטעינת מתכונים', err);
      }
    });
  }

  addRecipe(): void {
    if (!this.newRecipe.title) {
      alert('נא להזין שם למתכון');
      return;
    }

    this.isAddingRecipe = true;

    this.apiService.createRecipe(
      this.newRecipe.title || '',
      this.newRecipe.ingredients || '',
      this.newRecipe.instructions || '',
      this.newRecipe.tags || '',
      this.newRecipe.preparationTime || 0
    ).subscribe({
      next: (recipe: Recipe) => {
        this.recipes.push(recipe);
        this.newRecipe = {
          title: '',
          ingredients: '',
          instructions: '',
          tags: '',
          preparationTime: 0
        };
        this.isAddingRecipe = false;
        alert('המתכון נוסף בהצלחה!');
      },
      error: (err: any) => {
        alert('שגיאה בהוספת מתכון');
        this.isAddingRecipe = false;
      }
    });
  }

  editRecipe(recipe: Recipe): void {
    alert('עדיין בעבודה - עריכה תגיע בקרוב!');
  }

  deleteRecipe(recipeId: number): void {
    if (confirm('אתה בטוח שברצונך למחוק מתכון זה?')) {
      this.apiService.deleteRecipe(recipeId).subscribe({
        next: () => {
          this.recipes = this.recipes.filter(r => r.id !== recipeId);
          alert('המתכון נמחק בהצלחה!');
        },
        error: (err: any) => {
          alert('שגיאה במחיקת מתכון');
        }
      });
    }
  }

  logout(): void {
    this.apiService.removeToken();
    this.router.navigate(['/login']);
  }
}
