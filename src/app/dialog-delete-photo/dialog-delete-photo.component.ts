import { Component, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Photo } from '../models/photo.model';
import { PhotosService } from '../services/photos.service';

@Component({
  selector: 'app-dialog-delete-photo',
  templateUrl: './dialog-delete-photo.component.html',
  styleUrls: ['./dialog-delete-photo.component.css']
})
export class DialogDeletePhotoComponent implements OnInit {
 @Output()item:any
  constructor(
    private ps :PhotosService,
  ) { }

    photos: Photo[]= [];
    photosSubsription!:Subscription;



    onDeletePhoto(){
      
    }
  ngOnInit(): void {
  }

}
