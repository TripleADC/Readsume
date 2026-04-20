import { inject, Injectable } from '@angular/core';

// TENTATIVE
import { environment } from '../../../../environments/environment';

import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LoginService 
{
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  login() {
    return this.http.post(`${this.apiUrl}/users`, {})
      .pipe(
        catchError((err) => {
          let errorMsg = err.error?.message || 'An unknown error occured';
          return throwError(() => new Error(errorMsg))
        })
      )
  }
}
