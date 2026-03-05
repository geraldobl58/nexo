import { useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Edit2, Eye, Trash2 } from "lucide-react";

import { GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Chip,
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
} from "../hooks/use-my-listings";

import { CreatePublishResponse } from "../types/publish-types";
import {
  Listing,
  PropertyType,
  PropertyTypeLabel,
  StatusLabel,
} from "../enums/publish-details-enums";
import Image from "next/image";

// ---------------------------------------------------------------------------
// ActionsCell — componente dedicado para que hooks possam ser usados
// ---------------------------------------------------------------------------

function ActionsCell({ row }: { row: CreatePublishResponse }) {
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

export const listingColumns: GridColDef<CreatePublishResponse>[] = [
  {
    field: "media",
    headerName: "Foto",
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => {
      const firstImage = row.media?.find((item) => item.type === "IMAGE");
      if (!firstImage) {
        return (
          <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
            <span className="text-gray-500 text-sm">Sem foto</span>
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center w-full h-full">
          <Image
            src={firstImage.url}
            alt={row.title}
            width={56}
            height={10}
            className="w-80 h-14 rounded-full object-cover shrink-0 transition-transform duration-300 hover:scale-125"
          />
        </div>
      );
    },
  },
  {
    field: "title",
    headerName: "Título",
    flex: 1,
  },
  {
    field: "type",
    headerName: "Tipo",
    flex: 1,
    valueGetter: (_value, row) => {
      return PropertyTypeLabel[row.type as PropertyType];
    },
  },
  {
    field: "purpose",
    headerName: "Finalidade",
    flex: 1,
    valueGetter: (_value, row) => {
      return row.purpose.toUpperCase() === "SALE" ? "Venda" : "Aluguel";
    },
  },
  {
    field: "price",
    headerName: "Preço",
    flex: 1,
    valueGetter: (_value, row) => {
      return row.price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  {
    field: "leadsCount",
    headerName: "Leads",
    flex: 1,
    valueGetter: (_value, row) => {
      return row.leadsCount ?? 0;
    },
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    renderCell: ({ row }) => {
      return (
        <Chip
          label={StatusLabel[row.status as Listing]}
          color={
            row.status === "ACTIVE"
              ? "success"
              : row.status === "DRAFT"
                ? "default"
                : row.status === "INACTIVE"
                  ? "warning"
                  : "error"
          }
        />
      );
    },
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    flex: 1,
    renderCell: ({ row }) => {
      const result = formatDistanceToNow(new Date(row.createdAt), {
        addSuffix: true,
        locale: ptBR,
      });

      return result.replace("cerca de ", "");
    },
  },
  {
    field: "actions",
    headerName: "Ações",
    width: 220,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => <ActionsCell row={row} />,
  },
];
