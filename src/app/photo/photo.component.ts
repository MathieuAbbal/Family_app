import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogPhotoComponent } from '../dialog-photo/dialog-photo.component';
@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {

  constructor(public dialog:MatDialog) { }

  ngOnInit(): void {
  }
  openDialog(){
    const dialogRef = this.dialog.open(DialogPhotoComponent);

    dialogRef.afterClosed().subscribe( result =>{
      console.log({result})
    });
  } 



}
