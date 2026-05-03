import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

import { ApiGetModel } from '../model/general/api.get-model';
import { ApiGetModelSingle } from '../model/general/api.get-model.single';

@Injectable({
  providedIn: 'root',
})
export class DisplayNameGuardService 
{
  private httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getMyDisplayStatus(): Observable<boolean>
  {
    return this.httpClient.get<ApiGetModelSingle<boolean>>(`${environment.apiUrl}/users/display/status`)
      .pipe(
        map(x => x.data),
        catchError((err: HttpErrorResponse) => 
        { 
          return throwError(() => err);
        })
      );
  }
}
