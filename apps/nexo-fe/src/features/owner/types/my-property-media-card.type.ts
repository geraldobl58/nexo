// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

import { DragEvent } from "react";

import { MediaItem } from "./publish.type";

/** Representa um item na galeria de edição: pode ser um arquivo existente
 *  (já salvo no servidor) ou um arquivo novo aguardando upload. */
export type MediaSlot =
  | { kind: "existing"; item: MediaItem }
  | { kind: "new"; file: File; tempId: string };

export type MediaCardProps = {
  slot: MediaSlot;
  index: number;
  onRemove: (index: number) => void;
  isDragOver?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
};
