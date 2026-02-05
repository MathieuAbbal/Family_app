import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GoogleAuthService } from './google-auth.service';
import { auth } from '../firebase';
import { environment } from '../../environments/environment';

declare const gapi: any;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  thumbnailLink?: string;
  createdTime: string;
  isFolder: boolean;
  uploadedBy: string;
  uploadedByName: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  files: DriveFile[] = [];
  filesSubject = new Subject<DriveFile[]>();
  breadcrumb: BreadcrumbItem[] = [];
  breadcrumbSubject = new Subject<BreadcrumbItem[]>();
  private rootFolderId: string | null = null;
  currentFolderId: string | null = null;

  constructor(private googleAuth: GoogleAuthService) {}

  private ensureToken(): void {
    const token = this.googleAuth.getAccessToken();
    if (token) {
      gapi.client.setToken({ access_token: token });
    }
  }

  async ensureRootFolder(): Promise<string> {
    if (this.rootFolderId) return this.rootFolderId;
    if (!this.googleAuth.isConnected()) throw new Error('Not connected');

    // Use configured shared folder if available
    const configuredFolderId = environment.googleCalendar.familyDriveFolderId;
    if (configuredFolderId) {
      this.rootFolderId = configuredFolderId;
      return this.rootFolderId;
    }

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
      this.rootFolderId = folders[0].id;
      return this.rootFolderId!;
    }

    // Create folder
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: 'FamilyApp',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    this.rootFolderId = createResponse.result.id;
    return this.rootFolderId!;
  }

  async listFiles(folderId?: string): Promise<DriveFile[]> {
    if (!this.googleAuth.isConnected()) return [];
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      const rootId = await this.ensureRootFolder();
      const targetFolderId = folderId || rootId;
      this.currentFolderId = targetFolderId;

      const response = await gapi.client.drive.files.list({
        q: `'${targetFolderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,createdTime,properties)',
        orderBy: 'folder,name',
        pageSize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        corpora: 'allDrives',
      });

      this.files = (response.result.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        webViewLink: f.webViewLink || '',
        iconLink: f.iconLink || '',
        thumbnailLink: f.thumbnailLink || '',
        createdTime: f.createdTime || '',
        isFolder: f.mimeType === 'application/vnd.google-apps.folder',
        uploadedBy: f.properties?.uploadedBy || '',
        uploadedByName: f.properties?.uploadedByName || '',
      }));

      this.filesSubject.next(this.files);
      return this.files;
    } catch {
      return [];
    }
  }

  async navigateToFolder(folderId: string, folderName: string): Promise<void> {
    // Add to breadcrumb
    this.breadcrumb.push({ id: folderId, name: folderName });
    this.breadcrumbSubject.next(this.breadcrumb);
    await this.listFiles(folderId);
  }

  async navigateToBreadcrumb(index: number): Promise<void> {
    if (index < 0) {
      // Navigate to root
      this.breadcrumb = [];
      this.breadcrumbSubject.next(this.breadcrumb);
      await this.listFiles();
    } else {
      // Navigate to specific breadcrumb
      const item = this.breadcrumb[index];
      this.breadcrumb = this.breadcrumb.slice(0, index + 1);
      this.breadcrumbSubject.next(this.breadcrumb);
      await this.listFiles(item.id);
    }
  }

  async navigateUp(): Promise<void> {
    if (this.breadcrumb.length === 0) return;
    this.breadcrumb.pop();
    this.breadcrumbSubject.next(this.breadcrumb);
    const parentId = this.breadcrumb.length > 0 ? this.breadcrumb[this.breadcrumb.length - 1].id : undefined;
    await this.listFiles(parentId);
  }

  async createFolder(name: string): Promise<DriveFile | null> {
    if (!this.googleAuth.isConnected()) return null;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      const rootId = await this.ensureRootFolder();
      const parentId = this.currentFolderId || rootId;

      const user = auth.currentUser;
      const response = await gapi.client.drive.files.create({
        resource: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
          properties: {
            uploadedBy: user?.uid || '',
            uploadedByName: user?.displayName || '',
          },
        },
        fields: 'id,name,mimeType,createdTime',
      });

      const folder: DriveFile = {
        id: response.result.id,
        name: response.result.name,
        mimeType: response.result.mimeType,
        webViewLink: '',
        iconLink: '',
        createdTime: response.result.createdTime || '',
        isFolder: true,
        uploadedBy: user?.uid || '',
        uploadedByName: user?.displayName || '',
      };

      return folder;
    } catch {
      return null;
    }
  }

  async renameFile(fileId: string, newName: string): Promise<boolean> {
    if (!this.googleAuth.isConnected()) return false;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      await gapi.client.drive.files.update({
        fileId,
        resource: { name: newName },
      });
      return true;
    } catch {
      return false;
    }
  }

  async uploadFile(file: File): Promise<DriveFile | null> {
    if (!this.googleAuth.isConnected()) return null;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      const rootId = await this.ensureRootFolder();
      const parentId = this.currentFolderId || rootId;

      const user = auth.currentUser;
      const metadata = {
        name: file.name,
        parents: [parentId],
        properties: {
          uploadedBy: user?.uid || '',
          uploadedByName: user?.displayName || '',
        },
      };

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
        isFolder: false,
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
      await gapi.client.drive.files.delete({ fileId, supportsAllDrives: true });
    } catch {
      // silently fail
    }
  }

  async moveFile(fileId: string, targetFolderId: string): Promise<boolean> {
    if (!this.googleAuth.isConnected()) return false;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();

      // Get current parents
      const file = await gapi.client.drive.files.get({
        fileId,
        fields: 'parents',
      });
      const previousParents = file.result.parents?.join(',') || '';

      // Move file to new folder
      await gapi.client.drive.files.update({
        fileId,
        addParents: targetFolderId,
        removeParents: previousParents,
        fields: 'id, parents',
      });

      return true;
    } catch {
      return false;
    }
  }
}
