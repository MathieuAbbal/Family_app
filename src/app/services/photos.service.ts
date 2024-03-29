import { Injectable } from '@angular/core';
import { Photo } from '../models/photo.model';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  photos: Photo[] = [];
  photosSubject = new Subject<Photo[]>();
  constructor(
    private _snackBar: MatSnackBar

  ) {
    this.getPhotos();
  }

  durationInSeconds = 5;
  emitPhotos() {
    this.photosSubject.next(this.photos);
    console.log(this.photos);
  }
  savePhotos() {
    firebase.database().ref('/photos').set(this.photos);
    console.log('Images sauvegarder', this.photos);
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
 
  
  createNewPhoto(newPhoto: Photo) {
    this.photos.push(newPhoto);
    this.savePhotos();
    
    console.log('image enregistrer', this.photos)
    this._snackBar.open('Photo ajoutée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  }
  uploadFile(file: File) {
    return new Promise((resolve, reject) => {
      const almostUniqueFileName = Date.now().toString();
      const upload = firebase
        .storage()
        .ref()
        .child('photos/' + almostUniqueFileName + file.name)
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
  removePhoto(photo: Photo) {
    if (photo?.image) {
      const storageRef = firebase.storage().refFromURL(photo?.image);
      storageRef.delete().then(
        () => {
          console.log('Photo supprimée !');
        }
      ).catch(
        (error) => {
          console.log('Fichier non trouvé : ' + error);
        }
      )
    }
    const photoIndexToRemove = this.photos.findIndex(
      (El) => El === photo); 
    console.log(photoIndexToRemove);
    this.photos.splice(photoIndexToRemove, 1);
    this.savePhotos();
    this.emitPhotos();
    this._snackBar.open('Photo supprimée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    }); 
  }


  ngOnDestroy() {
    this.photosSubject.unsubscribe();
  }
}
