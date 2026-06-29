"use client";

import { ChangeEvent, PointerEvent, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Move, RotateCcw } from "lucide-react";
import {
  compressImageFile,
  formatFileSize,
} from "@/lib/image-compression";

type Props = {
  label: string;
  helper?: string;
  onCompressed: (file: File) => void;
  maxWidth?: number;
  maxHeight?: number;
};

export function ImageUploadField({
  label,
  helper,
  onCompressed,
  maxWidth = 1400,
  maxHeight = 1400,
}: Props) {
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const [originalSize, setOriginalSize] = useState("");
  const [compressedSize, setCompressedSize] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("market-villa-image.jpg");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isCompressing, setIsCompressing] = useState(false);
  const [message, setMessage] = useState("");

  const aspectRatio = maxWidth / maxHeight;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setSourceName(file.name || "market-villa-image.jpg");
    setOriginalSize(formatFileSize(file.size));
    setCompressedSize("");
    setPreviewUrl("");
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSourceUrl(URL.createObjectURL(file));
    event.target.value = "";
  }

  async function applyCrop() {
    const frame = cropFrameRef.current;
    const image = imageRef.current;

    if (!frame || !image || !sourceUrl) return;

    setMessage("");
    setIsCompressing(true);

    try {
      await image.decode().catch(() => undefined);

      const frameWidth = frame.clientWidth;
      const frameHeight = frame.clientHeight;
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const baseScale = Math.max(
        frameWidth / naturalWidth,
        frameHeight / naturalHeight,
      );
      const scale = baseScale * zoom;
      const renderedWidth = naturalWidth * scale;
      const renderedHeight = naturalHeight * scale;
      const imageLeft = frameWidth / 2 + offset.x - renderedWidth / 2;
      const imageTop = frameHeight / 2 + offset.y - renderedHeight / 2;
      const sourceX = Math.max(0, -imageLeft / scale);
      const sourceY = Math.max(0, -imageTop / scale);
      const sourceWidth = Math.min(naturalWidth - sourceX, frameWidth / scale);
      const sourceHeight = Math.min(
        naturalHeight - sourceY,
        frameHeight / scale,
      );

      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = maxHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to prepare image.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const croppedFile = await new Promise<File>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Unable to crop image."));
              return;
            }

            resolve(
              new File([blob], sourceName.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
              }),
            );
          },
          "image/jpeg",
          0.9,
        );
      });

      const compressedFile = await compressImageFile(croppedFile, {
        maxWidth,
        maxHeight,
        quality: 0.78,
        outputType: "image/jpeg",
      });

      setCompressedSize(formatFileSize(compressedFile.size));
      setPreviewUrl(URL.createObjectURL(compressedFile));
      setSourceUrl("");

      onCompressed(compressedFile);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to compress image.";

      setMessage(errorMessage);
    } finally {
      setIsCompressing(false);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      };
      pinchRef.current = null;
      return;
    }

    if (pointersRef.current.size === 2) {
      const points = Array.from(pointersRef.current.values());
      pinchRef.current = {
        distance: getDistance(points[0], points[1]),
        zoom,
      };
      dragRef.current = null;
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const points = Array.from(pointersRef.current.values());
      const distance = getDistance(points[0], points[1]);

      setZoom(
        clamp(
          pinchRef.current.zoom * (distance / pinchRef.current.distance),
          1,
          4,
        ),
      );
      return;
    }

    if (dragRef.current) {
      setOffset({
        x: dragRef.current.offsetX + event.clientX - dragRef.current.x,
        y: dragRef.current.offsetY + event.clientY - dragRef.current.y,
      });
    }
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    dragRef.current = null;
    pinchRef.current = null;
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>

          {helper ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
          ) : null}
        </div>

        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-600">
          {isCompressing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ImagePlus size={18} />
          )}
        </span>
      </div>

      <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm font-medium text-slate-600 hover:border-slate-950 hover:text-slate-950">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {sourceUrl ? "Choose another image" : "Choose image"}
      </label>

      {sourceUrl ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
          <div
            ref={cropFrameRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            className="relative mx-auto w-full max-w-sm touch-none overflow-hidden rounded-2xl bg-slate-100"
            style={{ aspectRatio }}
          >
            <img
              ref={imageRef}
              src={sourceUrl}
              alt="Image crop preview"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                height: "100%",
                minWidth: "100%",
                objectFit: "cover",
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                transformOrigin: "center",
              }}
            />
            <div className="pointer-events-none absolute inset-3 rounded-2xl border border-white/80" />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <Move size={16} className="text-slate-500" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-[var(--mv-violet)]"
              aria-label="Image zoom"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyCrop}
              disabled={isCompressing}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[#241436] px-4 text-sm font-black text-white disabled:opacity-60"
            >
              {isCompressing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Use image
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      ) : null}

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <img
            src={previewUrl}
            alt="Compressed preview"
            className="h-44 w-full object-cover"
          />
        </div>
      ) : null}

      {originalSize || compressedSize ? (
        <div className="mt-4 grid gap-2 rounded-2xl bg-white p-3 text-xs text-slate-500">
          {originalSize ? (
            <div className="flex justify-between gap-3">
              <span>Original</span>
              <span className="font-semibold text-slate-800">
                {originalSize}
              </span>
            </div>
          ) : null}

          {compressedSize ? (
            <div className="flex justify-between gap-3">
              <span>Compressed</span>
              <span className="font-semibold text-emerald-700">
                {compressedSize}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs text-red-700">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
