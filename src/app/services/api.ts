import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5058/api';
  
  constructor(private http: HttpClient) { }
  
  // ===== AUTH =====
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, {
      username,
      email,
      password
    });
  }
  
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      username,
      password
    });
  }
  
  // ===== TOKEN =====
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  removeToken(): void {
    localStorage.removeItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  // ===== RECIPES =====
  getMyRecipes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipes`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
  
  getRecipe(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipes/${id}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
  
  createRecipe(title: string, ingredients: string, instructions: string, tags: string, preparationTime: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipes`, {
      title,
      ingredients,
      instructions,
      tags,
      preparationTime
    }, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
  
  updateRecipe(id: number, title: string, ingredients: string, instructions: string, tags: string, preparationTime: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/recipes/${id}`, {
      title,
      ingredients,
      instructions,
      tags,
      preparationTime
    }, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
  
  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recipes/${id}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
  
  searchByTag(tag: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipes/search/${tag}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
}
