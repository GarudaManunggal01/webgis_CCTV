"use client";

import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import type { CctvCamera } from "@/app/types";
import HlsPlayer from "./hlsplayer";

const cctvIcon = L.icon({
  iconUrl: "/icons/image-3042333_1280.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -15],
});

export default function LeafletMap() {
  const [cameras, setCameras] = useState<CctvCamera[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<CctvCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestCctv, setNearestCctv] = useState<CctvCamera | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCameras() {
      try {
        const response = await fetch("/api/cctv");
        const data = await response.json();
        setCameras(data);
        setFilteredCameras(data);
      } catch (error) {
        console.error("Failed to fetch cameras:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCameras();
  }, []);

  useEffect(() => {
    const filtered = cameras.filter((camera) => {
      const matchesSearch = camera.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || camera.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredCameras(filtered);
  }, [searchQuery, statusFilter, cameras]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          findNearestCctv(latitude, longitude);
        },
        (error) => console.error("Geolocation error:", error)
      );
    }
  }, [cameras]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestCctv = (lat: number, lng: number) => {
    if (cameras.length === 0) return;

    let minDistance = Infinity;
    let closest: CctvCamera | null = null;

    cameras.forEach((camera) => {
      const dist = calculateDistance(lat, lng, camera.latitude, camera.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = camera;
      }
    });

    setNearestCctv(closest);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3">
        <div className="loading-spinner"></div>
        <p className="text-sm text-gray-500 font-medium">Memuat data peta...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3 bg-white text-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 w-64">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-black uppercase">Search CCTV</label>
          <input
            type="text"
            placeholder="Cari lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-sm border rounded outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-black uppercase">Filter Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 text-sm border rounded outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="text-xs text-gray-400 font-medium">
          Menampilkan {filteredCameras.length} dari {cameras.length} CCTV
        </div>

        {nearestCctv && (
          <div className="mt-2 pt-3 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">CCTV Terdekat</p>
            <div className="p-2 text-sm bg-blue-50 text-blue-700 rounded cursor-pointer hover:bg-blue-100 transition-colors">
              {nearestCctv.name}
            </div>
          </div>
        )}
        <div className="mt-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login Admin
          </button>
        </div>
      </div>

      <MapContainer
        center={[-7.7956, 110.3695]}
        zoom={12}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup>
          {filteredCameras.map((camera) => (
            <Marker
              key={camera.id}
              position={[camera.latitude, camera.longitude]}
              icon={cctvIcon}
            >
              <Popup>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-lg">{camera.name}</h3>

                  <p
                    className={`text-sm ${
                      camera.status === "online" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Status: {camera.status}
                  </p>

                  {camera.status === "online" ? (
                    <HlsPlayer src={camera.streamurl} />
                  ) : (
                    <p className="text-sm italic text-gray-500">CCTV Offline</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Lokasi Anda</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
