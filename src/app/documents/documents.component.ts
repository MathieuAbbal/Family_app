import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from '../services/google-auth.service';
import { GoogleDriveService, DriveFile, DocCategory, DOC_CATEGORIES } from '../services/google-drive.service';

import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  isConnected = false;
  files: DriveFile[] = [];
  categories = DOC_CATEGORIES;
  loading = false;
  uploading = false;
  showUploadForm = false;
  selectedCategory: DocCategory = 'autre';
  private filesSub!: Subscription;
  private connSub!: Subscription;

  constructor(
    private googleAuth: GoogleAuthService,
    private driveService: GoogleDriveService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.filesSub = this.driveService.filesSubject.subscribe(
      (files) => this.files = files
    );
    this.connSub = this.googleAuth.connectionChanged.subscribe((connected) => {
      this.isConnected = connected;
      if (connected) this.loadFiles();
    });
    this.isConnected = this.googleAuth.isConnected();
    if (this.isConnected) this.loadFiles();
  }

  async loadFiles() {
    this.loading = true;
    await this.driveService.listFiles();
    this.loading = false;
  }

  get filesByCategory(): { key: DocCategory; label: string; icon: string; files: DriveFile[] }[] {
    return this.categories
      .map(cat => ({
        ...cat,
        files: this.files.filter(f => f.category === cat.key)
      }))
      .filter(cat => cat.files.length > 0);
  }

  connectGoogle() {
    this.googleAuth.signIn().then((connected) => {
      this.isConnected = connected;
      if (connected) this.loadFiles();
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadFile(input.files[0]);
    input.value = '';
  }

  async uploadFile(file: File) {
    this.uploading = true;
    const result = await this.driveService.uploadFile(file, this.selectedCategory);
    this.uploading = false;
    this.showUploadForm = false;
    if (result) {
      await this.loadFiles();
      this.snackBar.open('Document ajoute !', '', { duration: 3000 });
    }
  }

  openFile(file: DriveFile) {
    window.open(file.webViewLink, '_blank');
  }

  async deleteFile(file: DriveFile) {
    await this.driveService.deleteFile(file.id);
    await this.loadFiles();
    this.snackBar.open('Document supprime', '', { duration: 3000 });
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    return '📎';
  }

  ngOnDestroy() {
    if (this.filesSub) this.filesSub.unsubscribe();
    if (this.connSub) this.connSub.unsubscribe();
  }
}
