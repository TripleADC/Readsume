import { inject, Injectable } from '@angular/core';

// TENTATIVE
import { environment } from '../../../environments/environment';

import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ApiGetModel } from '../model/general/api.get-model';
import { ApiGetModelSingle } from '../model/general/api.get-model.single';

import { FieldGetModel } from '../model/field/field.get-model';
import { UserFieldGetModel } from '../model/field/userField.get-model';


@Injectable({
  providedIn: 'root',
})
export class FieldService 
{
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getFields(): Observable<FieldGetModel[]>
  {
    return this.http.get<ApiGetModel<FieldGetModel>>(`${this.apiUrl}/fields`)
      .pipe(
        map(res => res.data),
        catchError((err) => {
          let errorMsg = err.error?.message || 'An unknown error occured';
          return throwError(() => new Error(errorMsg))
        })
      )
  }

  getUserFields(): Observable<UserFieldGetModel[]>
  {
    return this.http.get<ApiGetModel<UserFieldGetModel>>(`${this.apiUrl}/fields/user`)
      .pipe(
        map(res => res.data),
        catchError((err) => {
          let errorMsg = err.error?.message || 'An unknown error occured';
          return throwError(() => new Error(errorMsg))
        })
      )
  }
}
