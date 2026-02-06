import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  constructor(
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar,
    private appRef: ApplicationRef
  ) {}

  init(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Check for updates when app stabilizes, then every 30 minutes
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
    const everyThirtyMinutes$ = interval(30 * 60 * 1000);
    const checkInterval$ = concat(appIsStable$, everyThirtyMinutes$);

    checkInterval$.subscribe(() => {
      this.swUpdate.checkForUpdate().catch(() => {
        // Silent fail - SW might not be available
      });
    });

    // Listen for available updates
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.showUpdateNotification();
      });
  }

  private showUpdateNotification(): void {
    const snackBarRef = this.snackBar.open(
      '🚀 Nouvelle version disponible !',
      'Mettre à jour',
      {
        duration: 0, // Don't auto-dismiss
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['update-snackbar']
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.applyUpdate();
    });
  }

  private applyUpdate(): void {
    this.swUpdate.activateUpdate().then(() => {
      window.location.reload();
    });
  }
}
