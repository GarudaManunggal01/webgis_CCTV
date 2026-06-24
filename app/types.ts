export interface CctvCamera {
  id: number;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  streamUrl: string;
  status: string;
  thumbnail?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CctvStats {
  total: number;
  online: number;
  offline: number;
}

export type CctvFormData = {
  name: string;
  latitude: string;
  longitude: string;
  streamUrl: string;
  status: string;
  thumbnail: string;
};
