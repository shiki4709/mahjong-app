"use client";

import { QRCodeSVG } from "qrcode.react";

export function EventQRCode({ url, eventName }: { url: string; eventName: string }) {
  return (
    <div className="text-center p-4 bg-white rounded-lg">
      <QRCodeSVG value={url} size={200} className="mx-auto" />
      <p className="mt-2 text-sm text-gray-600">Scan to join: {eventName}</p>
      <p className="text-xs text-gray-400 mt-1 break-all">{url}</p>
    </div>
  );
}
