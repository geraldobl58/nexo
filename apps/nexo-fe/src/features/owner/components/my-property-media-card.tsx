import { Button, Chip } from "@mui/material";

import { ACCEPTED_TYPES, formatBytes } from "@/lib/media-upload";

import { MediaCardProps } from "../types/my-property-media-card";

export const MyPropertyMediaCard = ({
  slot,
  index,
  onRemove,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: MediaCardProps) => {
  const isImage =
    slot.kind === "existing"
      ? slot.item.type === "IMAGE"
      : ACCEPTED_TYPES[slot.file.type] === "IMAGE";

  const thumbnailUrl =
    slot.kind === "existing" ? slot.item.url : URL.createObjectURL(slot.file);

  const displayName =
    slot.kind === "existing"
      ? isImage
        ? `Foto ${index + 1}`
        : `Vídeo ${index + 1}`
      : slot.file.name;

  const displaySize = slot.kind === "new" ? formatBytes(slot.file.size) : null;

  const isNewFile = slot.kind === "new";

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
      {/* Badge "Novo" para arquivos ainda não enviados */}
      {isNewFile && (
        <div className="absolute top-7 left-1 z-10">
          <span className="inline-flex items-center rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
            Novo
          </span>
        </div>
      )}
      {/* Thumbnail */}
      <div className="h-28 flex items-center justify-center bg-gray-100">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={displayName}
            className="h-full w-full object-cover"
            onLoad={() => {
              if (slot.kind === "new") URL.revokeObjectURL(thumbnailUrl);
            }}
          />
        ) : (
          <div className="relative h-full w-full">
            <video
              src={thumbnailUrl}
              className="h-full w-full object-cover"
              muted
              preload="auto"
              onLoadedData={(e) => {
                const video = e.target as HTMLVideoElement;
                if (video.duration > 1) video.currentTime = 1;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/40 rounded-full p-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="px-2 py-1">
        <p className="text-xs text-gray-700 truncate" title={displayName}>
          {index === 0 ? (
            <span className="font-semibold text-blue-600">[Capa] </span>
          ) : null}
          {displayName}
        </p>
        {displaySize && <p className="text-xs text-gray-400">{displaySize}</p>}
      </div>
      <div className="w-full flex items-center justify-center pb-1">
        {/* Badge tipo */}
        <Chip
          size="small"
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
