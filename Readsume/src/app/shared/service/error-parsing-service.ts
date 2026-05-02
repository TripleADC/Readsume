import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorParsingService 
{
  parseError(err: HttpErrorResponse): string
  {
    let errorToShow: string = err.message;

    if (err.error.msg != null)
    {
      errorToShow = err.error.msg
    }

    return errorToShow;
  }
}
