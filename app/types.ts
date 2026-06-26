export interface CctvCamera {
  id: number;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  streamurl: string;
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
  streamurl: string;
  status: string;
  thumbnail: string;
};
