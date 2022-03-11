import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dialog-delete-photo',
  templateUrl: './dialog-delete-photo.component.html',
  styleUrls: ['./dialog-delete-photo.component.css'],
})
export class DialogDeletePhotoComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogDeletePhotoComponent>,
    private _snackBar: MatSnackBar
  ) {}
  durationInSeconds = 5;
  openSnackBar() {
    this._snackBar.open('Photo supprimée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  }
  ngOnInit(): void {}
  ngOnDestroy() {}
}
