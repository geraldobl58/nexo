import { useState } from "react";

import { Edit2, Eye, Trash2 } from "lucide-react";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Switch,
} from "@mui/material";

import {
  useDeleteMyListing,
  usePublishMyListing,
  useUnpublishMyListing,
} from "../hooks/use-my-listings.hook";

import { CreatePublishResponse } from "../types/publish.type";

// ---------------------------------------------------------------------------
// ActionsCell — componente dedicado para que hooks possam ser usados
// ---------------------------------------------------------------------------

export function ActionsCell({ row }: { row: CreatePublishResponse }) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: doDelete, isPending } = useDeleteMyListing();
  const { mutateAsync: doPublish, isPending: isPublishing } =
    usePublishMyListing();
  const { mutateAsync: doUnpublish, isPending: isUnpublishing } =
    useUnpublishMyListing();

  const isBusy = isPublishing || isUnpublishing;

  async function handleToggle() {
    if (row.status === "ACTIVE") {
      await doUnpublish(row.id);
    } else {
      // DRAFT ou INACTIVE → publish aceita ambos
      await doPublish(row.id);
    }
  }

  async function handleConfirmDelete() {
    await doDelete(row.id);
    setOpen(false);
  }

  return (
    <>
      <IconButton
        component="a"
        href={`/imovel/${row.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Eye size={20} className="text-primary" />
      </IconButton>

      <IconButton component="a" href={`/panel/my-properties/${row.id}`}>
        <Edit2 size={16} className="text-primary" />
      </IconButton>

      <IconButton color="error" onClick={() => setOpen(true)}>
        <Trash2 size={20} />
      </IconButton>

      {isBusy ? (
        <CircularProgress size={20} />
      ) : (
        <Switch
          checked={row.status === "ACTIVE"}
          onChange={handleToggle}
          color="primary"
          disabled={row.status === "SOLD" || row.status === "RENTED"}
          title={
            row.status === "ACTIVE"
              ? "Desativar imóvel"
              : row.status === "INACTIVE"
                ? "Reativar imóvel"
                : "Publicar imóvel"
          }
        />
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Excluir imóvel</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja excluir{" "}
            <strong>&ldquo;{row.title}&rdquo;</strong>? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
