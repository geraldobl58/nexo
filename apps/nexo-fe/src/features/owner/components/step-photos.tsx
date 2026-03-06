/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useRef, useState, DragEvent } from "react";

import { usePublish } from "../context/publish-context";

import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_TYPES,
  MAX_IMAGES_FREE,
  MAX_IMAGES_PAID,
  MAX_VIDEOS,
  validateFile,
} from "@/lib/media-upload";

// MOCK: enquanto o pagamento não estiver implementado, novos imóveis são
// sempre criados com plano FREE (limite de 5 fotos). Quando os planos pagos
// forem ativados, esse valor virá do contexto/estado do usuário.
const CURRENT_PLAN_MAX_IMAGES = MAX_IMAGES_FREE;

import { PreviewCard } from "./preview-card";

export const StepPhotos = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { mediaFiles, setMediaFiles, reorderMediaFiles } = usePublish();
  const inputRef = useRef<HTMLInputElement>(null);
  // Ref para evitar stale closure no drag-and-drop entre cards
  const draggingIndexRef = useRef<number | null>(null);

  const imageCount = mediaFiles.filter(
    (f) => ACCEPTED_TYPES[f.type] === "IMAGE",
  ).length;
  const videoCount = mediaFiles.filter(
    (f) => ACCEPTED_TYPES[f.type] === "VIDEO",
  ).length;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newErrors: string[] = [];
      const toAdd: File[] = [];

      let imgs = imageCount;
      let vids = videoCount;

      Array.from(incoming).forEach((file) => {
        const error = validateFile(file, imgs, vids, CURRENT_PLAN_MAX_IMAGES);
        if (error) {
          newErrors.push(error);
          return;
        }
        toAdd.push(file);
        if (ACCEPTED_TYPES[file.type] === "IMAGE") imgs++;
        else vids++;
      });

      setErrors(newErrors);
      if (toAdd.length > 0) {
        setMediaFiles([...mediaFiles, ...toAdd]);
      }
    },
    [mediaFiles, setMediaFiles, imageCount, videoCount],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      // Reset input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    },
    [addFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    },
    [mediaFiles, setMediaFiles],
  );

  // ── Drag-and-drop entre cards (reordenação) ────────────────────────────

  const handleCardDragStart = useCallback(
    (index: number, e: DragEvent<HTMLDivElement>) => {
      draggingIndexRef.current = index;
      // Necessário para que o evento dragover/drop funcione no Firefox
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    [],
  );

  const handleCardDragOver = useCallback(
    (index: number, e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation(); // não aciona o dropzone de arquivos
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    [],
  );

  const handleCardDragLeave = useCallback((_e: DragEvent<HTMLDivElement>) => {
    setDragOverIndex(null);
  }, []);

  const handleCardDrop = useCallback(
    (toIndex: number, e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation(); // não aciona o dropzone de arquivos
      const fromIndex = draggingIndexRef.current;
      if (fromIndex !== null && fromIndex !== toIndex) {
        reorderMediaFiles(fromIndex, toIndex);
      }
      draggingIndexRef.current = null;
      setDragOverIndex(null);
    },
    [reorderMediaFiles],
  );

  const handleCardDragEnd = useCallback(() => {
    draggingIndexRef.current = null;
    setDragOverIndex(null);
  }, []);

  // ── Drag-and-drop da zona de upload (adicionar arquivos) ───────────────

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-6 mt-10 shadow-md bg-white">
      <div>
        <h3 className="text-2xl font-bold">Fotos e vídeos do imóvel</h3>

        {/* Badge de limite por plano */}
        <div className="flex items-center gap-3 mt-2 mb-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
            Plano FREE — até {MAX_IMAGES_FREE} fotos
          </span>
          <span className="text-xs text-gray-400">
            Planos pagos permitem até {MAX_IMAGES_PAID} fotos
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-1">
          As fotos são opcionais agora — você pode adicioná-las depois. A
          primeira imagem será usada como capa do anúncio. Arraste os cards para
          reordenar.
        </p>
      </div>

      {/* Contador */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>
          📷 <strong>{imageCount}</strong>/{MAX_IMAGES} fotos
        </span>
        <span>
          🎥 <strong>{videoCount}</strong>/{MAX_VIDEOS} vídeos
        </span>
      </div>

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Clique ou arraste arquivos aqui"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div className="text-center">
          <p className="font-medium text-gray-700">
            Clique para selecionar ou arraste os arquivos aqui
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Fotos: JPEG, PNG, WebP — máx. 10 MB cada — até{" "}
            {CURRENT_PLAN_MAX_IMAGES} no plano atual &nbsp;|&nbsp; Vídeos: MP4,
            MOV — máx. 100 MB cada
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Erros de validação */}
      {errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((err, i) => (
            <li key={i} className="text-sm text-red-600 flex items-start gap-1">
              <span>⚠️</span> {err}
            </li>
          ))}
        </ul>
      )}

      {/* Grid de prévias */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {mediaFiles.map((file, index) => (
            <PreviewCard
              key={`${file.name}-${file.size}-${index}`}
              file={file}
              index={index}
              onRemove={handleRemove}
              isDragOver={dragOverIndex === index}
              onDragStart={(e) => handleCardDragStart(index, e)}
              onDragOver={(e) => handleCardDragOver(index, e)}
              onDragLeave={handleCardDragLeave}
              onDrop={(e) => handleCardDrop(index, e)}
              onDragEnd={handleCardDragEnd}
            />
          ))}
        </div>
      )}

      {mediaFiles.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          Nenhum arquivo selecionado ainda.
        </p>
      )}
    </div>
  );
};
