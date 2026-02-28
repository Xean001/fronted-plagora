import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = localStorage.getItem('plagora_access');

    if (token) {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next(req).pipe(
        catchError(err => {
            if (err.status === 401) {
                localStorage.removeItem('plagora_access');
                localStorage.removeItem('plagora_refresh');
                router.navigate(['/login']);
            }
            return throwError(() => err);
        })
    );
};
