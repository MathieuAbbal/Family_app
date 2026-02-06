import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from '../services/google-auth.service';
import { GoogleDriveService, DriveFile, BreadcrumbItem } from '../services/google-drive.service';

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
  breadcrumb: BreadcrumbItem[] = [];
  loading = false;
  uploading = false;

  // Modals
  showNewFolderModal = false;
  newFolderName = '';
  showRenameModal = false;
  renameTarget: DriveFile | null = null;
  renameName = '';
  showDeleteModal = false;
  deleteTarget: DriveFile | null = null;

  private filesSub!: Subscription;
  private breadcrumbSub!: Subscription;
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
    this.breadcrumbSub = this.driveService.breadcrumbSubject.subscribe(
      (breadcrumb) => this.breadcrumb = breadcrumb
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

  get folders(): DriveFile[] {
    return this.files.filter(f => f.isFolder);
  }

  get documents(): DriveFile[] {
    return this.files.filter(f => !f.isFolder);
  }

  connectGoogle() {
    this.googleAuth.signIn().then((connected) => {
      this.isConnected = connected;
      if (connected) this.loadFiles();
    });
  }

  reconnectGoogle() {
    // Force new consent to get fresh token with all scopes (including drive)
    this.googleAuth.signIn().then((connected) => {
      this.isConnected = connected;
      if (connected) this.loadFiles();
    });
  }

  // Navigation
  async openFolder(folder: DriveFile) {
    this.loading = true;
    await this.driveService.navigateToFolder(folder.id, folder.name);
    this.loading = false;
  }

  async goToRoot() {
    this.loading = true;
    await this.driveService.navigateToBreadcrumb(-1);
    this.loading = false;
  }

  async goToBreadcrumb(index: number) {
    this.loading = true;
    await this.driveService.navigateToBreadcrumb(index);
    this.loading = false;
  }

  async goUp() {
    this.loading = true;
    await this.driveService.navigateUp();
    this.loading = false;
  }

  // Create folder
  openNewFolderModal() {
    this.newFolderName = '';
    this.showNewFolderModal = true;
  }

  closeNewFolderModal() {
    this.showNewFolderModal = false;
    this.newFolderName = '';
  }

  async createFolder() {
    if (!this.newFolderName.trim()) return;
    const result = await this.driveService.createFolder(this.newFolderName.trim());
    this.closeNewFolderModal();
    if (result) {
      await this.driveService.listFiles(this.driveService.currentFolderId || undefined);
      this.snackBar.open('Dossier créé !', '', { duration: 3000 });
    }
  }

  // Rename
  openRenameModal(file: DriveFile) {
    this.renameTarget = file;
    this.renameName = file.name;
    this.showRenameModal = true;
  }

  closeRenameModal() {
    this.showRenameModal = false;
    this.renameTarget = null;
    this.renameName = '';
  }

  async confirmRename() {
    if (!this.renameTarget || !this.renameName.trim()) return;
    const success = await this.driveService.renameFile(this.renameTarget.id, this.renameName.trim());
    this.closeRenameModal();
    if (success) {
      await this.driveService.listFiles(this.driveService.currentFolderId || undefined);
      this.snackBar.open('Renommé !', '', { duration: 3000 });
    }
  }

  // Drag and drop
  draggedFile: DriveFile | null = null;
  dragOverFolder: string | null = null;

  onDragStart(event: DragEvent, file: DriveFile) {
    this.draggedFile = file;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd() {
    this.draggedFile = null;
    this.dragOverFolder = null;
  }

  onDragOver(event: DragEvent, folder: DriveFile) {
    event.preventDefault();
    if (this.draggedFile && !this.draggedFile.isFolder) {
      this.dragOverFolder = folder.id;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    }
  }

  onDragLeave(folder: DriveFile) {
    if (this.dragOverFolder === folder.id) {
      this.dragOverFolder = null;
    }
  }

  async onDrop(event: DragEvent, folder: DriveFile) {
    event.preventDefault();
    this.dragOverFolder = null;
    if (this.draggedFile && !this.draggedFile.isFolder) {
      const success = await this.driveService.moveFile(this.draggedFile.id, folder.id);
      if (success) {
        await this.driveService.listFiles(this.driveService.currentFolderId || undefined);
        this.snackBar.open(`Fichier déplacé dans "${folder.name}"`, '', { duration: 3000 });
      }
    }
    this.draggedFile = null;
  }

  // Delete
  openDeleteModal(file: DriveFile) {
    this.deleteTarget = file;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  async confirmDelete() {
    if (!this.deleteTarget) return;
    await this.driveService.deleteFile(this.deleteTarget.id);
    this.closeDeleteModal();
    await this.driveService.listFiles(this.driveService.currentFolderId || undefined);
    this.snackBar.open('Supprimé', '', { duration: 3000 });
  }

  // Upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadFile(input.files[0]);
    input.value = '';
  }

  async uploadFile(file: File) {
    this.uploading = true;
    const result = await this.driveService.uploadFile(file);
    this.uploading = false;
    if (result) {
      await this.driveService.listFiles(this.driveService.currentFolderId || undefined);
      this.snackBar.open('Document ajouté !', '', { duration: 3000 });
    }
  }

  openFile(file: DriveFile) {
    window.open(file.webViewLink, '_blank');
  }

  getFileIcon(mimeType: string): string {
    if (mimeType === 'application/vnd.google-apps.folder') return '📁';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    return '📎';
  }

  ngOnDestroy() {
    if (this.filesSub) this.filesSub.unsubscribe();
    if (this.breadcrumbSub) this.breadcrumbSub.unsubscribe();
    if (this.connSub) this.connSub.unsubscribe();
  }
}
