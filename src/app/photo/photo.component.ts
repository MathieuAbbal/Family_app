import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogDeletePhotoComponent } from '../dialog-delete-photo/dialog-delete-photo.component';
import { DialogPhotoComponent } from '../dialog-photo/dialog-photo.component';
import { Photo } from '../models/photo.model';
import { PhotosService } from '../services/photos.service';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {
  photos: Photo[] = [];
  photosSubscription!: Subscription;

  constructor(public dialog: MatDialog,
    private ps: PhotosService) { }

  hideButton = false;

  

  scrollSubscription!: Subscription
  ngOnInit(): void {
    this.photosSubscription = this.ps.photosSubject.subscribe(
      (photos: Photo[]) => {
        this.photos = photos.sort((a, b) => {
          const dateA = new Date(a.createdDate);
          const dateB = new Date(b.createdDate);
          return dateB.getTime() - dateA.getTime();  // Tri décroissant par createdDate
        });
      });
    this.ps.emitPhotos();
    this.ps.getPhotos();
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogPhotoComponent);

  
  }
  onDelete(photo: Photo) {
    let dialogRef = this.dialog.open(DialogDeletePhotoComponent, {
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(
      (result:Boolean) => {
        if (result === true) {
          this.ps.removePhoto(photo);
        }
        else { return; }
      }
    )
  }
  onScroll(event: any): void {
    if(event){
      this.hideButton = true
      if(event.target.scrollTop === 0){
        this.hideButton = false
      }
    }
  }
  ngAfterViewInit(): void {
    
}
  ngOnDestroy() {
    if (this.photosSubscription) { this.photosSubscription.unsubscribe() }
    if (this.scrollSubscription) { this.scrollSubscription.unsubscribe() }
  }
}
