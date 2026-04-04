import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GoogleAuthService } from './google-auth.service';
import { PlatformService } from './platform.service';
import { auth } from '../firebase';
import { environment } from '../../environments/environment';

declare const gapi: any;

const DRIVE_API = 'https://www.googleapis.com/drive/v3';

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

  constructor(
    private googleAuth: GoogleAuthService,
    private platform: PlatformService
  ) {}

  private ensureToken(): void {
    if (!this.platform.isWeb()) return;
    const token = this.googleAuth.getAccessToken();
    if (token && typeof gapi !== 'undefined') {
      gapi.client.setToken({ access_token: token });
    }
  }

  /** Make an authenticated fetch to Google Drive REST API */
  private async restFetch(path: string, options: RequestInit = {}): Promise<any> {
    const token = this.googleAuth.getAccessToken();
    if (!token) throw new Error('No access token');
    const resp = await fetch(`${DRIVE_API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!resp.ok) throw new Error(`Drive API error: ${resp.status}`);
    if (resp.status === 204) return {};
    return resp.json();
  }

  async ensureRootFolder(): Promise<string> {
    if (this.rootFolderId) return this.rootFolderId;
    if (!this.googleAuth.isConnected()) throw new Error('Not connected');

    const configuredFolderId = environment.googleCalendar.familyDriveFolderId;
    if (configuredFolderId) {
      this.rootFolderId = configuredFolderId;
      return this.rootFolderId;
    }

    if (this.platform.isNative()) {
      const params = new URLSearchParams({
        q: "name='FamilyApp' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id,name)',
        spaces: 'drive',
      });
      const data = await this.restFetch(`/files?${params}`);
      const folders = data.files || [];
      if (folders.length > 0) {
        this.rootFolderId = folders[0].id;
        return this.rootFolderId!;
      }
      const created = await this.restFetch('/files', {
        method: 'POST',
        body: JSON.stringify({
          name: 'FamilyApp',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      this.rootFolderId = created.id;
      return this.rootFolderId!;
    }

    await this.googleAuth.loadGapi();
    this.ensureToken();

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
      const rootId = await this.ensureRootFolder();
      const targetFolderId = folderId || rootId;
      this.currentFolderId = targetFolderId;

      let files: any[];

      if (this.platform.isNative()) {
        const params = new URLSearchParams({
          q: `'${targetFolderId}' in parents and trashed=false`,
          fields: 'files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,createdTime,properties)',
          orderBy: 'folder,name',
          pageSize: '100',
          includeItemsFromAllDrives: 'true',
          supportsAllDrives: 'true',
          corpora: 'allDrives',
        });
        const data = await this.restFetch(`/files?${params}`);
        files = data.files || [];
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
        const response = await gapi.client.drive.files.list({
          q: `'${targetFolderId}' in parents and trashed=false`,
          fields: 'files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,createdTime,properties)',
          orderBy: 'folder,name',
          pageSize: 100,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          corpora: 'allDrives',
        });
        files = response.result.files || [];
      }

      this.files = files.map((f: any) => ({
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
    this.breadcrumb.push({ id: folderId, name: folderName });
    this.breadcrumbSubject.next(this.breadcrumb);
    await this.listFiles(folderId);
  }

  async navigateToBreadcrumb(index: number): Promise<void> {
    if (index < 0) {
      this.breadcrumb = [];
      this.breadcrumbSubject.next(this.breadcrumb);
      await this.listFiles();
    } else {
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
      const rootId = await this.ensureRootFolder();
      const parentId = this.currentFolderId || rootId;
      const user = auth.currentUser;

      let result: any;

      if (this.platform.isNative()) {
        result = await this.restFetch('/files', {
          method: 'POST',
          body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
            properties: {
              uploadedBy: user?.uid || '',
              uploadedByName: user?.displayName || '',
            },
          }),
        });
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
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
        result = response.result;
      }

      return {
        id: result.id,
        name: result.name,
        mimeType: result.mimeType,
        webViewLink: '',
        iconLink: '',
        createdTime: result.createdTime || '',
        isFolder: true,
        uploadedBy: user?.uid || '',
        uploadedByName: user?.displayName || '',
      };
    } catch {
      return null;
    }
  }

  async renameFile(fileId: string, newName: string): Promise<boolean> {
    if (!this.googleAuth.isConnected()) return false;
    try {
      if (this.platform.isNative()) {
        await this.restFetch(`/files/${fileId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: newName }),
        });
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
        await gapi.client.drive.files.update({
          fileId,
          resource: { name: newName },
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async uploadFile(file: File): Promise<DriveFile | null> {
    if (!this.googleAuth.isConnected()) return null;
    try {
      const rootId = await this.ensureRootFolder();
      const parentId = this.currentFolderId || rootId;
      const user = auth.currentUser;
      const token = this.googleAuth.getAccessToken();

      const metadata = {
        name: file.name,
        parents: [parentId],
        properties: {
          uploadedBy: user?.uid || '',
          uploadedByName: user?.displayName || '',
        },
      };

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
      if (this.platform.isNative()) {
        await this.restFetch(`/files/${fileId}?supportsAllDrives=true`, {
          method: 'DELETE',
        });
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
        await gapi.client.drive.files.delete({ fileId, supportsAllDrives: true });
      }
    } catch {
      // silently fail
    }
  }

  async moveFile(fileId: string, targetFolderId: string): Promise<boolean> {
    if (!this.googleAuth.isConnected()) return false;
    try {
      if (this.platform.isNative()) {
        // Get current parents
        const file = await this.restFetch(`/files/${fileId}?fields=parents`);
        const previousParents = (file.parents || []).join(',');
        await this.restFetch(`/files/${fileId}?addParents=${targetFolderId}&removeParents=${previousParents}&fields=id,parents`, {
          method: 'PATCH',
        });
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
        const file = await gapi.client.drive.files.get({
          fileId,
          fields: 'parents',
        });
        const previousParents = file.result.parents?.join(',') || '';
        await gapi.client.drive.files.update({
          fileId,
          addParents: targetFolderId,
          removeParents: previousParents,
          fields: 'id, parents',
        });
      }
      return true;
    } catch {
      return false;
    }
  }
}
