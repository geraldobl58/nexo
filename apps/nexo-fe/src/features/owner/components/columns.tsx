import Image from "next/image";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

import { CreatePublishResponse } from "../types/publish.type";

import {
  Listing,
  PropertyType,
  PropertyTypeLabel,
  StatusLabel,
} from "../enums/listing.enum";
import { ActionsCell } from "./action-cell";

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
