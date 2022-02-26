import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-delete-photo',
  templateUrl: './dialog-delete-photo.component.html',
  styleUrls: ['./dialog-delete-photo.component.css'],
})
export class DialogDeletePhotoComponent implements OnInit {
 
  constructor(public dialogRef: MatDialogRef<DialogDeletePhotoComponent>) {}

  
  ngOnInit(): void {}
  ngOnDestroy() {
    
  }
}
