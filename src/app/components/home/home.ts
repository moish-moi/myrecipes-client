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
  imageUrl?: string;
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
  isEditingRecipe: boolean = false;
  editingRecipeId: number | null = null;
  searchTerm: string = '';
  filteredRecipes: Recipe[] = [];
  isLoadingRecipes: boolean = false;

  // העלאת תמונה עם Cloudinary
  selectedImage: string = '';
  cloudinaryCloudName: string = 'dbfvvswgd';
  cloudinaryUploadPreset: string = 'myrecipes_upload';
  isUploadingImage: boolean = false;

  
  newRecipe: Partial<Recipe> = {
    title: '',
    ingredients: '',
    instructions: '',
    tags: '',
    preparationTime: undefined,
    imageUrl: '' 
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
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload.sub || 'משתמש';
      } catch (e) {
        this.username = 'משתמש';
      }
    }
  }


 loadRecipes(): void {
  this.isLoadingRecipes = true;
  
  this.apiService.getMyRecipes().subscribe({
    next: (recipes: Recipe[]) => {
      this.recipes = recipes;
      this.filteredRecipes = recipes;
      this.isLoadingRecipes = false;
    },
    error: (err: any) => {
      console.error('שגיאה בטעינת מתכונים', err);
      this.isLoadingRecipes = false;
      alert('❌ שגיאה בטעינת המתכונים');
    }
  });
}


  addRecipe(): void {
  // ===== VALIDATION =====
  if (!this.newRecipe.title || this.newRecipe.title.trim() === '') {
    alert('⚠️ שם המתכון הוא חובה');
    return;
  }
  
  if (!this.newRecipe.ingredients || this.newRecipe.ingredients.trim() === '') {
    alert('⚠️ רכיבים הם חובה');
    return;
  }

  if (!this.newRecipe.instructions || this.newRecipe.instructions.trim() === '') {
    alert('⚠️ הוראות הכנה הן חובה');
    return;
  }

  if (this.newRecipe.preparationTime === undefined || this.newRecipe.preparationTime === null || this.newRecipe.preparationTime < 1) {
    alert('⚠️ זמן הכנה חייב להיות חיובי');
    return;
  }
  // ===== END VALIDATION =====

  this.isAddingRecipe = true;

  this.apiService.createRecipe(
    this.newRecipe.title || '',
    this.newRecipe.ingredients || '',
    this.newRecipe.instructions || '',
    this.newRecipe.tags || '',
    this.newRecipe.preparationTime || 0,
    this.newRecipe.imageUrl || ''
  ).subscribe({
    next: (recipe: Recipe) => {
      this.recipes.push(recipe);
      this.filteredRecipes = this.recipes;
      this.selectedImage = '';
      this.newRecipe = {
        title: '',
        ingredients: '',
        instructions: '',
        tags: '',
        preparationTime: undefined,
        imageUrl: ''
      };
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
      this.isAddingRecipe = false;
      alert('✅ המתכון נוסף בהצלחה!');
    },
    error: (err: any) => {
      console.error('API Error:', err);
      alert('❌ שגיאה בהוספת מתכון: ' + (err.error?.message || 'נסה שנית'));
      this.isAddingRecipe = false;
    }
  });
}


  editRecipe(recipe: Recipe): void {
    this.isEditingRecipe = true;
    this.editingRecipeId = recipe.id;
    this.newRecipe = { ...recipe };
    this.selectedImage = recipe.imageUrl || '';
  }

  saveEditedRecipe(): void {
  // ===== VALIDATION =====
  if (!this.newRecipe.title || this.newRecipe.title.trim() === '') {
    alert('⚠️ שם המתכון הוא חובה');
    return;
  }

  if (!this.newRecipe.ingredients || this.newRecipe.ingredients.trim() === '') {
    alert('⚠️ רכיבים הם חובה');
    return;
  }

  if (!this.newRecipe.instructions || this.newRecipe.instructions.trim() === '') {
    alert('⚠️ הוראות הכנה הן חובה');
    return;
  }

  if (this.newRecipe.preparationTime === undefined || this.newRecipe.preparationTime === null || this.newRecipe.preparationTime < 1) {
    alert('⚠️ זמן הכנה חייב להיות חיובי');
    return;
  }
  // ===== END VALIDATION =====

  if (!this.editingRecipeId) return;

  this.isAddingRecipe = true;

  this.apiService.updateRecipe(
    this.editingRecipeId,
    this.newRecipe.title || '',
    this.newRecipe.ingredients || '',
    this.newRecipe.instructions || '',
    this.newRecipe.tags || '',
    this.newRecipe.preparationTime || 0,
    this.newRecipe.imageUrl || ''  // ← הוסף את imageUrl!
  ).subscribe({
    next: (updatedRecipe: Recipe) => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
      const index = this.recipes.findIndex(r => r.id === this.editingRecipeId);
      if (index !== -1) {
        this.recipes[index] = updatedRecipe;
        this.filteredRecipes = [...this.recipes];  // ← עדכן את filteredRecipes!
      }
      this.cancelEdit();
      this.isAddingRecipe = false;
      alert('✅ המתכון עודכן בהצלחה!');
    },
    error: (err: any) => {
      console.error('API Error:', err);
      alert('❌ שגיאה בעדכון מתכון: ' + (err.error?.message || 'נסה שנית'));
      this.isAddingRecipe = false;
    }
  });
}



  cancelEdit(): void {
    this.isEditingRecipe = false;
    this.editingRecipeId = null;
    this.newRecipe = {
      title: '',
      ingredients: '',
      instructions: '',
      tags: '',
      preparationTime: undefined,
      imageUrl: ''
    };
    this.selectedImage = ''
  }

  deleteRecipe(recipeId: number): void {
    if (confirm('אתה בטוח שברצונך למחוק מתכון זה?')) {
      this.apiService.deleteRecipe(recipeId).subscribe({
        next: () => {
          this.recipes = this.recipes.filter(r => r.id !== recipeId);
          this.filteredRecipes = this.recipes;
          alert('המתכון נמחק בהצלחה!');
        },
        error: (err: any) => {
          alert('שגיאה במחיקת מתכון');
        }
      });
    }
  }

  onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  this.isUploadingImage = true;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', this.cloudinaryUploadPreset);

  // העלה ל-Cloudinary
  this.apiService.uploadImageToCloudinary(formData, this.cloudinaryCloudName).subscribe({
    next: (response: any) => {
      this.selectedImage = response.secure_url;
      this.newRecipe.imageUrl = response.secure_url;
      this.isUploadingImage = false;
    },
    error: (err: any) => {
      console.error('שגיאה בהעלאת תמונה', err);
      alert('❌ שגיאה בהעלאת התמונה');
      this.isUploadingImage = false;
    }
  });
}

clearImage(): void {
  this.selectedImage = '';
  this.newRecipe.imageUrl = '';
}


  searchByTag(): void {
  if (!this.searchTerm || this.searchTerm.trim() === '') {
    this.filteredRecipes = this.recipes;
    return;
  }

  const term = this.searchTerm.toLowerCase().trim();
  this.filteredRecipes = this.recipes.filter(recipe =>
    recipe.tags.toLowerCase().includes(term)
  );
}

clearSearch(): void {
  this.searchTerm = '';
  this.filteredRecipes = this.recipes;
}


  logout(): void {
    this.apiService.removeToken();
    this.router.navigate(['/login']);
  }
}
