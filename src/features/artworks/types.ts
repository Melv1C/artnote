import { ArtworkStatus } from '@/schemas';

export type ArtworkFilter = {
  search?: string;
  status?: ArtworkStatus[];
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
};

export type ArtworkSortOption = {
  value: ArtworkFilter['sortBy'];
  label: string;
};
