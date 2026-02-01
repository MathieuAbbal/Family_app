import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-dialog',
    imports: [],
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  customMessage: string;
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customMessage: string },
  ) {
    this.customMessage = data.customMessage;
  }
}
