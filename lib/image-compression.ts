export type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: "image/jpeg" | "image/webp";
};

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.78,
    outputType = "image/jpeg",
  } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  const imageBitmap = await createImageBitmap(file);

  let targetWidth = imageBitmap.width;
  let targetHeight = imageBitmap.height;

  const widthRatio = maxWidth / targetWidth;
  const heightRatio = maxHeight / targetHeight;
  const scale = Math.min(widthRatio, heightRatio, 1);

  targetWidth = Math.round(targetWidth * scale);
  targetHeight = Math.round(targetHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to prepare image compression.");
  }

  context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Unable to compress image."));
          return;
        }

        resolve(result);
      },
      outputType,
      quality
    );
  });

  const extension = outputType === "image/webp" ? "webp" : "jpg";
  const cleanName = file.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${cleanName}-compressed.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
