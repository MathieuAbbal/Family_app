import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  constructor(
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar
  ) {}

  init(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Check after 10 seconds, then every 30 minutes
    // (appRef.isStable never resolves with Firebase realtime listeners)
    setTimeout(() => {
      this.swUpdate.checkForUpdate().catch(() => {});
    }, 10_000);

    interval(30 * 60 * 1000).subscribe(() => {
      this.swUpdate.checkForUpdate().catch(() => {});
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
        duration: 0,
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
