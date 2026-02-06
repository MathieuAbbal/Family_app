export interface Vacation {
  id: string;
  title: string;
  destination: string;
  lat?: number;
  lng?: number;
  startDate: string;
  endDate: string;
  description?: string;
  coverImage?: string;
  createdBy: string;
  createdByName: string;
  status: 'planning' | 'ongoing' | 'completed';
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  addedBy: string;
}

export interface VacationPhoto {
  id: string;
  url: string;
  caption?: string;
  lat?: number;
  lng?: number;
  addedBy: string;
  addedByName: string;
  addedAt: string;
}
