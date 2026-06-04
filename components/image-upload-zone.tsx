"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

type UploadZoneProps = {
  title: string;
  instruction: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

export function ImageUploadZone({
  title,
  instruction,
  required,
  value,
  onChange,
  disabled,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const pickFile = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      onChange(file);
    },
    [onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      pickFile(file ?? null);
    },
    [disabled, pickFile]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {title}
            {required && <span className="text-red-500"> *</span>}
          </p>
          <p className="text-xs text-slate-500">{instruction}</p>
        </div>
        {value ? (
          <Badge variant="success">נבחר</Badge>
        ) : (
          <Badge variant="muted">{required ? "נדרש" : "אופציונלי"}</Badge>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/95 py-2.5 text-sm font-medium text-slate-800"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <RefreshCw className="h-4 w-4" />
              החלף
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-xl bg-white/95 px-4 py-2.5 text-red-600"
              onClick={() => onChange(null)}
              disabled={disabled}
              aria-label="הסר תמונה"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition",
            dragOver
              ? "border-brand-500 bg-brand-50"
              : "border-slate-200 bg-slate-50/80 hover:border-brand-400 hover:bg-brand-50/50",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/80">
            <Camera className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">הקש לצילום או בחירה מהגלריה</p>
            <p className="mt-1 text-xs text-slate-500">
              ניתן לגרור תמונה לכאן במחשב · JPG, PNG, WebP
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200/80">
            <ImagePlus className="h-3.5 w-3.5" />
            העלאת תמונה
          </span>
        </div>
      )}
    </div>
  );
}
