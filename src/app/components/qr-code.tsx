"use client";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

interface Props {
  url: string;
  size?: number;
}

export function QrCode({ url, size = 256 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: size });
    }
  }, [url, size]);

  return <canvas ref={canvasRef} />;
}
