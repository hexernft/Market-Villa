"use client";

import Image from "next/image";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  Crop,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Trash2,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  businessId: string;
  imageType: "logo" | "cover";
  aspect: "square" | "wide";
};

const bucketName = "business-assets";

export function ImageUploadEditor({
  label,
  value,
  onChange,
  businessId,
  imageType,
  aspect,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const previewUrl = sourceUrl || value;
  const cropClass =
    aspect === "square" ? "aspect-square" : "aspect-[16/5]";

  const transformStyle = useMemo(() => {
    return {
      transform: `translate(-50%, -50%) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
      left: `${positionX}%`,
      top: `${positionY}%`,
    };
  }, [flipX, flipY, positionX, positionY, rotation, zoom]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setMessage("");
  }

  async function exportEditedImage() {
    if (!sourceFile || !sourceUrl) {
      setMessage("Choose an image first.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const image = await loadImage(sourceUrl);

      const outputWidth = aspect === "square" ? 900 : 1600;
      const outputHeight = aspect === "square" ? 900 : 500;

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Image editor could not start.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, outputWidth, outputHeight);

      context.save();

      const centerX = outputWidth / 2;
      const centerY = outputHeight / 2;

      context.translate(centerX, centerY);
      context.rotate((rotation * Math.PI) / 180);
      context.scale(flipX ? -1 : 1, flipY ? -1 : 1);

      const baseScale = Math.max(
        outputWidth / image.naturalWidth,
        outputHeight / image.naturalHeight,
      );

      const finalScale = baseScale * zoom;
      const drawWidth = image.naturalWidth * finalScale;
      const drawHeight = image.naturalHeight * finalScale;

      const offsetX = ((positionX - 50) / 50) * (drawWidth - outputWidth) * -0.5;
      const offsetY =
        ((positionY - 50) / 50) * (drawHeight - outputHeight) * -0.5;

      context.drawImage(
        image,
        -drawWidth / 2 + offsetX,
        -drawHeight / 2 + offsetY,
        drawWidth,
        drawHeight,
      );

      context.restore();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error("Could not export image."));
              return;
            }

            resolve(result);
          },
          "image/webp",
          0.9,
        );
      });

      const filePath = `businesses/${businessId}/${imageType}-${Date.now()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          cacheControl: "3600",
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      onChange(data.publicUrl);
      setSourceFile(null);
      setSourceUrl("");
      setMessage("Image ready. Save changes to update your store.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function resetEditor() {
    setSourceFile(null);
    setSourceUrl("");
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setMessage("");
  }

  return (
    <div className="rounded-[1.25rem] border border-[#e8def8] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-slate-800">{label}</h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#e8def8] bg-white px-3 text-xs font-black text-[#241436] transition hover:border-[#7c3aed]"
          >
            <Upload size={14} />
            {previewUrl ? "Replace" : "Upload"}
          </button>

          {previewUrl ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                resetEditor();
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e8def8] text-red-500 transition hover:border-red-300"
              aria-label="Remove image"
            >
              <Trash2 size={15} />
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div
        className={`${cropClass} relative overflow-hidden rounded-[1rem] border border-[#eee7f7] bg-[#faf8ff]`}
      >
        {previewUrl ? (
          sourceUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="absolute max-h-none max-w-none object-cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${positionX}% ${positionY}%`,
                transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
              }}
            />
          ) : (
            <Image
              src={previewUrl}
              alt={label}
              fill
              sizes={aspect === "square" ? "220px" : "760px"}
              className="object-cover"
            />
          )
        ) : (
          <div className="grid h-full place-items-center text-[#7c3aed]">
            <ImageIcon size={32} />
          </div>
        )}
      </div>

      {sourceUrl ? (
        <div className="mt-4 grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRotation((current) => current - 90)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e8def8] text-[#241436]"
              aria-label="Rotate left"
            >
              <RotateCcw size={15} />
            </button>

            <button
              type="button"
              onClick={() => setRotation((current) => current + 90)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e8def8] text-[#241436]"
              aria-label="Rotate right"
            >
              <RotateCw size={15} />
            </button>

            <button
              type="button"
              onClick={() => setFlipX((current) => !current)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e8def8] text-[#241436]"
              aria-label="Flip horizontal"
            >
              <FlipHorizontal size={15} />
            </button>

            <button
              type="button"
              onClick={() => setFlipY((current) => !current)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e8def8] text-[#241436]"
              aria-label="Flip vertical"
            >
              <FlipVertical size={15} />
            </button>

            <button
              type="button"
              onClick={resetEditor}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#e8def8] text-[#241436]"
              aria-label="Reset"
            >
              <RefreshCcw size={15} />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-xs font-black text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Crop size={13} />
                Zoom
              </span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-1 text-xs font-black text-slate-600">
              Position X
              <input
                type="range"
                min="0"
                max="100"
                value={positionX}
                onChange={(event) => setPositionX(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-1 text-xs font-black text-slate-600">
              Position Y
              <input
                type="range"
                min="0"
                max="100"
                value={positionY}
                onChange={(event) => setPositionY(Number(event.target.value))}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={exportEditedImage}
            disabled={isUploading}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#241436] px-5 text-sm font-black text-white transition hover:bg-[#3b1b5d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Apply image"}
          </button>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 text-center text-xs font-semibold text-slate-500">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load selected image."));
    image.src = src;
  });
}

