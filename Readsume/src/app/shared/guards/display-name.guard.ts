import { Injectable, inject } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router, GuardResult, MaybeAsync, RouterStateSnapshot } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";
import { DisplayNameGuardService } from "../service/display-name.guard.service";

@Injectable({ providedIn: 'root'})
export class DisplayNameGuard implements CanActivate
{
    private router = inject(Router);
    private displayNameGuardService = inject(DisplayNameGuardService);

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> 
    {
        return this.displayNameGuardService.getMyDisplayStatus()
            .pipe(
                map(hasDisplayName => 
                    {
                        if (!hasDisplayName) 
                        {
                            this.router.navigate(['/display-name']);
                            return false;
                        }
                        return true;
                    }),
                catchError(() => {
                    this.router.navigate(['/display-name']);
                    return of(false);
                })
            );
    }
}