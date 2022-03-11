import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dialog-delete',
  templateUrl: './dialog-delete.component.html',
  styleUrls: ['./dialog-delete.component.css'],
})
export class DialogDeleteComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteComponent>,
    private _snackBar: MatSnackBar
  ) {}
  durationInSeconds = 5;

  openSnackBar() {
    this._snackBar.open('Tache supprimée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  }

  ngOnDestroy() {}
  ngOnInit(): void {}
}
