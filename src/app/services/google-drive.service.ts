import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GoogleAuthService } from './google-auth.service';
import { auth } from '../firebase';

declare const gapi: any;

export type DocCategory = 'sante' | 'ecole' | 'administratif' | 'recettes' | 'autre';

export const DOC_CATEGORIES: { key: DocCategory; label: string; icon: string }[] = [
  { key: 'sante', label: 'Santé', icon: '🏥' },
  { key: 'ecole', label: 'École', icon: '🎒' },
  { key: 'administratif', label: 'Administratif', icon: '📋' },
  { key: 'recettes', label: 'Recettes', icon: '🍳' },
  { key: 'autre', label: 'Autre', icon: '📦' },
];

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  thumbnailLink?: string;
  createdTime: string;
  category: DocCategory;
  uploadedBy: string;
  uploadedByName: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  files: DriveFile[] = [];
  filesSubject = new Subject<DriveFile[]>();
  private folderId: string | null = null;

  constructor(private googleAuth: GoogleAuthService) {}

  private ensureToken(): void {
    const token = this.googleAuth.getAccessToken();
    if (token) {
      gapi.client.setToken({ access_token: token });
    }
  }

  async ensureFolder(): Promise<string> {
    if (this.folderId) return this.folderId;
    if (!this.googleAuth.isConnected()) throw new Error('Not connected');

    await this.googleAuth.loadGapi();
    this.ensureToken();

    // Search for existing FamilyApp folder
    const searchResponse = await gapi.client.drive.files.list({
      q: "name='FamilyApp' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id,name)',
      spaces: 'drive',
    });

    const folders = searchResponse.result.files || [];
    if (folders.length > 0) {
      this.folderId = folders[0].id;
      return this.folderId!;
    }

    // Create folder
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: 'FamilyApp',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    this.folderId = createResponse.result.id;
    return this.folderId!;
  }

  async listFiles(): Promise<DriveFile[]> {
    if (!this.googleAuth.isConnected()) return [];
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      const folderId = await this.ensureFolder();

      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,createdTime,properties)',
        orderBy: 'createdTime desc',
        pageSize: 100,
      });

      this.files = (response.result.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        webViewLink: f.webViewLink || '',
        iconLink: f.iconLink || '',
        thumbnailLink: f.thumbnailLink || '',
        createdTime: f.createdTime || '',
        category: f.properties?.category || 'autre',
        uploadedBy: f.properties?.uploadedBy || '',
        uploadedByName: f.properties?.uploadedByName || '',
      }));

      this.filesSubject.next(this.files);
      return this.files;
    } catch {
      return [];
    }
  }

  async uploadFile(file: File, category: DocCategory): Promise<DriveFile | null> {
    if (!this.googleAuth.isConnected()) return null;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      const folderId = await this.ensureFolder();

      const user = auth.currentUser;
      const metadata = {
        name: file.name,
        parents: [folderId],
        properties: {
          category,
          uploadedBy: user?.uid || '',
          uploadedByName: user?.displayName || '',
        },
      };

      // Use multipart upload via fetch (gapi doesn't support file upload directly)
      const token = this.googleAuth.getAccessToken();
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const resp = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,iconLink,thumbnailLink,createdTime,properties',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      const result = await resp.json();

      return {
        id: result.id,
        name: result.name,
        mimeType: result.mimeType,
        webViewLink: result.webViewLink || '',
        iconLink: result.iconLink || '',
        thumbnailLink: result.thumbnailLink || '',
        createdTime: result.createdTime || '',
        category,
        uploadedBy: user?.uid || '',
        uploadedByName: user?.displayName || '',
      };
    } catch {
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.googleAuth.isConnected()) return;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      await gapi.client.drive.files.delete({ fileId });
    } catch {
      // silently fail
    }
  }
}
