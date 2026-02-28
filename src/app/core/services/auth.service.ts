import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, TokenPair } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly API = 'http://localhost:8080/api';
    private readonly ACCESS_KEY = 'plagora_access';
    private readonly REFRESH_KEY = 'plagora_refresh';

    constructor(private http: HttpClient, private router: Router) { }

    login(req: LoginRequest): Observable<TokenPair> {
        return this.http.post<TokenPair>(`${this.API}/auth/login`, req).pipe(
            tap(tokens => this.saveTokens(tokens))
        );
    }

    refresh(): Observable<TokenPair> {
        const refresh_token = localStorage.getItem(this.REFRESH_KEY) ?? '';
        return this.http.post<TokenPair>(`${this.API}/auth/refresh`, { refresh_token }).pipe(
            tap(tokens => this.saveTokens(tokens))
        );
    }

    logout(): void {
        localStorage.removeItem(this.ACCESS_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem(this.ACCESS_KEY);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_KEY);
    }

    private saveTokens(tokens: TokenPair): void {
        localStorage.setItem(this.ACCESS_KEY, tokens.access_token);
        localStorage.setItem(this.REFRESH_KEY, tokens.refresh_token);
    }
}
