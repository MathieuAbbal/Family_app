import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogPhotoComponent } from '../dialogs/dialog-photo/dialog-photo.component';
import { Photo } from '../models/photo.model';
import { PhotosService } from '../services/photos.service';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {
  photos: Photo[] = [];
  photosSubscription!: Subscription;
  private _snackBar: MatSnackBar
  @ViewChild('photoContainer') photoContainer!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private ps: PhotosService
    ) { }

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
    const dialogRef = this.dialog.open(DialogPhotoComponent, {
      disableClose: true
    });

  
  }
  onDelete(photo: Photo) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent,  { 
      data: { customMessage: "Etes-vous sûr(e) de vouloir supprimer la photo ?" } ,
      
    })
    dialogRef.afterClosed().subscribe(
      result => {
        if (result === true) {
          this.ps.removePhoto(photo)
        }
        else { return }
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

  scrollToTop(): void {
    if (this.photoContainer) {
      this.photoContainer.nativeElement.scrollTop = 0;
    }
  }

  ngAfterViewInit(): void {
    
  }
  ngOnDestroy() {
    if (this.photosSubscription) { this.photosSubscription.unsubscribe() }
    if (this.scrollSubscription) { this.scrollSubscription.unsubscribe() }
  }
}
