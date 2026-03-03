import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import type { Note } from "@/constants/types/global.types";

const MAX_MB = 10;
export type MediaKind = "image" | "audio" | "video";

export interface MediaSlot {
  id: string;
  file: File;
  kind: MediaKind;
}

export function useMediaSlots(slotCount = 7) {
  const [slots, setSlots] = useState<(MediaSlot | null)[]>(Array(slotCount).fill(null));
  const [previews, setPreviews] = useState<(string | null)[]>(Array(slotCount).fill(null));
  const [loading, setLoading] = useState<boolean[]>(Array(slotCount).fill(false));
  const [error, setError] = useState<Note | undefined>();

  const detectKind = (file: File): MediaKind | null => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("video/")) return "video";
    return null;
  };

  const setFileAtSlot = useCallback(async (index: number, file: File) => {
    const kind = detectKind(file);
    if (!kind) {
      setError({ type: "error", title: "Unsupported file type" });
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      setError({ type: "error", title: "File too large", body: `${MAX_MB}MB max` });
      return;
    }

    setLoading(l => {
      const c = [...l];
      c[index] = true;
      return c;
    });

    try {
      let finalFile = file;

      // image-only compression
      if (kind === "image") {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 450,
          useWebWorker: true,
        });

        finalFile = new File([compressed], file.name, {
          type: compressed.type,
          lastModified: compressed.lastModified,
        });
      }

      setSlots(s => {
        const c = [...s];
        c[index] = { id: String(index), file: finalFile, kind };
        return c;
      });

      setPreviews(p => {
        const c = [...p];
        if (c[index]) URL.revokeObjectURL(c[index]!);
        c[index] = URL.createObjectURL(finalFile);
        return c;
      });
    } catch {
      setError({ type: "error", title: "Failed to process file" });
    } finally {
      setLoading(l => {
        const c = [...l];
        c[index] = false;
        return c;
      });
    }
  }, []);

  const removeFileAtSlot = useCallback((index: number) => {
    setSlots(s => {
      const c = [...s];
      c[index] = null;
      return c;
    });

    setPreviews(p => {
      const c = [...p];
      if (c[index]) URL.revokeObjectURL(c[index]!);
      c[index] = null;
      return c;
    });
  }, []);

  const clearAll = useCallback(() => {
    previews.forEach(p => p && URL.revokeObjectURL(p));
    setSlots(Array(slotCount).fill(null));
    setPreviews(Array(slotCount).fill(null));
  }, [previews, slotCount]);

  return {
    slots,
    previews,
    loading,
    error,
    setFileAtSlot,
    removeFileAtSlot,
    clearAll,
  };
}