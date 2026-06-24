"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
}

export default function HlsPlayer({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      width="350"
      style={{
        borderRadius: "8px",
      }}
    />
  );
}