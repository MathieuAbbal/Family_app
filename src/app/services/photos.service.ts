import { Injectable } from '@angular/core';
import { Photo } from '../models/photo.model';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  photos: Photo[] = [];
  photosSubject = new Subject<Photo[]>();
  constructor() {
    this.getPhotos();
  }

  getPhotos() {
    firebase
      .database()
      .ref('/photos')
      .on('value', (data) => {
        this.photos = data.val() ? data.val() : [];
        this.emitPhotos();
        console.log('photos récupérer', this.photos);
      });
  }
  emitPhotos() {
    this.photosSubject.next(this.photos);
    console.log(this.photos);
  }
  savePhotos() {
    firebase.database().ref('/photos').set(this.photos);
    console.log('Images sauvegarder', this.photos);
  }
  createNewPhoto(newPhoto: Photo) {
    this.photos.push(newPhoto);
    this.savePhotos;
    this.emitPhotos;
  }
  uploadFile(file: File) {
    return new Promise((resolve, reject) => {
      const almostUniqueFileName = Date.now().toString();
      const upload = firebase
        .storage()
        .ref()
        .child('images/' + almostUniqueFileName + file.name)
        .put(file);
      upload.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {
          console.log('Chargement…');
        },
        (error) => {
          console.log('Erreur de chargement ! : ' + error);
          reject();
        },
        () => {
          resolve(upload.snapshot.ref.getDownloadURL());
        }
      );
    });
  }
}
