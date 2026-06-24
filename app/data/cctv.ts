export type CctvCamera = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  streamUrl: string;
  status: "online" | "offline";
  thumbnail?: string;
};

export const CCTV_CAMERAS: CctvCamera[] = [
  {
    id: "borobudur-plaza",
    name: "Simpang Borobudur Plaza",
    latitude: -7.7829,
    longitude: 110.3671,
    streamUrl:
      "https://cctvjss.jogjakota.go.id/atcs/ATCS_Simpang_Borobudur_Plaza.stream/playlist.m3u8",
    status: "online",
  },
  {
    id: "tugu-jogja",
    name: "Simpang Tugu Yogyakarta",
    latitude: -7.7828,
    longitude: 110.3670,
    streamUrl:
      "https://cctvjss.jogjakota.go.id/atcs/ATCS_Simpang_Borobudur_Plaza.stream/playlist.m3u8",
    status: "online",
  },
  {
    id: "jombor",
    name: "Simpang Jombor",
    latitude: -7.7478,
    longitude: 110.3612,
    streamUrl:
      "https://cctvjss.jogjakota.go.id/atcs/ATCS_Simpang_Borobudur_Plaza.stream/playlist.m3u8",
    status: "online",
  },
  {
    id: "gejayan",
    name: "Simpang Gejayan",
    latitude: -7.7745,
    longitude: 110.3904,
    streamUrl:
      "https://cctvjss.jogjakota.go.id/atcs/ATCS_Simpang_Borobudur_Plaza.stream/playlist.m3u8",
    status: "online",
  },
  {
    id: "ringroad-utara",
    name: "Simpang Ring Road Utara",
    latitude: -7.7582,
    longitude: 110.4036,
    streamUrl:
      "https://cctvjss.jogjakota.go.id/atcs/ATCS_Simpang_Borobudur_Plaza.stream/playlist.m3u8",
    status: "online",
  },
];