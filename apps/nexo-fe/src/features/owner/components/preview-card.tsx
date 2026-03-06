import { DragEvent } from "react";

import { ACCEPTED_TYPES, formatBytes } from "@/lib/media-upload";
import { Button, Chip } from "@mui/material";

type PreviewCardProps = {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  isDragOver?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
};

export const PreviewCard = ({
  file,
  index,
  onRemove,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: PreviewCardProps) => {
  const isImage = ACCEPTED_TYPES[file.type] === "IMAGE";
  const objectUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative group rounded-lg overflow-hidden border-2 bg-gray-50 transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragOver
          ? "border-blue-500 scale-105 shadow-lg"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Drag handle */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 text-white/70 drop-shadow pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M7 2a1 1 0 000 2 1 1 0 000-2zM13 2a1 1 0 000 2 1 1 0 000-2zM7 8a1 1 0 000 2 1 1 0 000-2zM13 8a1 1 0 000 2 1 1 0 000-2zM7 14a1 1 0 000 2 1 1 0 000-2zM13 14a1 1 0 000 2 1 1 0 000-2z" />
        </svg>
      </div>

      {/* Thumbnail */}
      <div className="h-28 flex items-center justify-center bg-gray-100">
        {isImage && objectUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={objectUrl}
            alt={file.name}
            className="h-full w-full object-cover"
            onLoad={() => URL.revokeObjectURL(objectUrl)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs">Vídeo</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-1">
        <p className="text-xs text-gray-700 truncate" title={file.name}>
          {index === 0 ? (
            <span className="font-semibold text-blue-600">[Capa] </span>
          ) : null}
          {file.name}
        </p>
        <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
      </div>

      <div className="w-full flex items-center justify-center">
        {/* Badge tipo */}
        <Chip
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            isImage
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}
          label={isImage ? "Imagem" : "Vídeo"}
        />

        {/* Botão remover — sempre visível */}
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow"
          aria-label="Remover arquivo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
