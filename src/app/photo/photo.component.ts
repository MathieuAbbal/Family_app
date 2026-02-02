import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogPhotoComponent } from '../dialogs/dialog-photo/dialog-photo.component';
import { Photo } from '../models/photo.model';
import { PhotosService } from '../services/photos.service';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { CommentsService } from '../services/comments.service';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';

import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

@Component({
    selector: 'app-photo',
    imports: [CommonModule, FormsModule],
    templateUrl: './photo.component.html',
    styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit, AfterViewInit, OnDestroy {
  photos: Photo[] = [];
  photosSubscription!: Subscription;
  @ViewChild('photoContainer') photoContainer!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private ps: PhotosService,
    private commentsService: CommentsService
  ) { }

  hideButton = false;
  scrollSubscription!: Subscription;
  currentUid = auth.currentUser?.uid || '';
  usersCache: { [uid: string]: { displayName: string; photoURL: string } } = {};

  ngOnInit(): void {
    get(ref(db, '/users')).then(snap => {
      const data = snap.val() || {};
      Object.keys(data).forEach(uid => {
        this.usersCache[uid] = {
          displayName: data[uid].displayName || '',
          photoURL: data[uid].photoURL || ''
        };
      });
    });
    this.photosSubscription = this.ps.photosSubject.subscribe(
      (photos: Photo[]) => {
        this.photos = photos.sort((a, b) => {
          const dateA = new Date(a.createdDate);
          const dateB = new Date(b.createdDate);
          return dateB.getTime() - dateA.getTime();
        });
        this.loadInteractions();
      });
    this.ps.emitPhotos();
    this.ps.getPhotos();
  }

  loadInteractions() {
    const uid = auth.currentUser?.uid;
    this.photos.forEach((photo, i) => {
      this.commentsService.getComments(i).then(comments => photo._comments = comments);
      this.commentsService.getLikeCount(i).then(count => photo._likeCount = count);
      if (uid) {
        this.commentsService.isLiked(i, uid).then(liked => photo._liked = liked);
      }
    });
  }

  toggleLike(index: number) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    this.commentsService.toggleLike(index, uid).then(liked => {
      this.photos[index]._liked = liked;
      return this.commentsService.getLikeCount(index);
    }).then(count => {
      this.photos[index]._likeCount = count;
    });
  }

  toggleComments(index: number) {
    this.photos[index]._showComments = !this.photos[index]._showComments;
    if (this.photos[index]._showComments && !this.photos[index]._comments?.length) {
      this.commentsService.getComments(index).then(comments => this.photos[index]._comments = comments);
    }
  }

  addComment(index: number) {
    const text = this.photos[index]._newCommentText?.trim();
    if (!text) return;
    const user = auth.currentUser;
    if (!user) return;
    get(ref(db, `/users/${user.uid}`)).then(snapshot => {
      const profile = snapshot.val() || {};
      const comment = {
        photoIndex: index,
        userId: user.uid,
        userName: profile.displayName || user.displayName || user.email || 'Anonyme',
        userPhoto: profile.photoURL || user.photoURL || '',
        text,
        createdDate: new Date().toISOString()
      };
      return this.commentsService.addComment(index, comment);
    }).then(() => {
      this.photos[index]._newCommentText = '';
      this.commentsService.getComments(index).then(comments => this.photos[index]._comments = comments);
    });
  }

  deleteComment(photoIndex: number, commentId: string) {
    this.commentsService.deleteComment(photoIndex, commentId).then(() => {
      this.commentsService.getComments(photoIndex).then(comments => this.photos[photoIndex]._comments = comments);
    });
  }

  openDialog() {
    this.dialog.open(DialogPhotoComponent, { disableClose: true });
  }

  onDelete(photo: Photo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sur(e) de vouloir supprimer la photo ?" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.ps.removePhoto(photo);
      }
    });
  }

  private mainEl: HTMLElement | null = null;
  private scrollHandler = () => {
    this.hideButton = (this.mainEl?.scrollTop || 0) > 200;
  };

  ngAfterViewInit(): void {
    this.mainEl = document.querySelector('main');
    this.mainEl?.addEventListener('scroll', this.scrollHandler);
  }

  scrollToTop(): void {
    this.mainEl?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.mainEl?.removeEventListener('scroll', this.scrollHandler);
    if (this.photosSubscription) { this.photosSubscription.unsubscribe(); }
    if (this.scrollSubscription) { this.scrollSubscription.unsubscribe(); }
  }
}
