"use client";

import { ChangeEvent, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
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
  const [originalSize, setOriginalSize] = useState("");
  const [compressedSize, setCompressedSize] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setIsCompressing(true);
    setOriginalSize(formatFileSize(file.size));
    setCompressedSize("");

    try {
      const compressedFile = await compressImageFile(file, {
        maxWidth,
        maxHeight,
        quality: 0.78,
        outputType: "image/jpeg",
      });

      setCompressedSize(formatFileSize(compressedFile.size));
      setPreviewUrl(URL.createObjectURL(compressedFile));

      onCompressed(compressedFile);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to compress image.";

      setMessage(errorMessage);
    } finally {
      setIsCompressing(false);
    }
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
        {isCompressing ? "Compressing image..." : "Choose image"}
      </label>

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

