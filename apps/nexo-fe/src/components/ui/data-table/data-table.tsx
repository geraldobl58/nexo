/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridPaginationModel,
  GridDensity,
  GridSortModel,
  GridFilterModel,
  GridRowId,
  GridValidRowModel,
  GridSlots,
} from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { SxProps, Theme } from "@mui/material";
import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DataTablePaginationOptions {
  /** Current pagination state (controlled). */
  model: GridPaginationModel;
  /** Called when page or pageSize changes. */
  onModelChange: (model: GridPaginationModel) => void;
  /** Total number of rows (required for server-side pagination). */
  rowCount?: number;
  /** Available page-size options. Defaults to [10, 25, 50]. */
  pageSizeOptions?: number[];
}

export interface DataTableProps<TRow extends GridValidRowModel> {
  /** Column definitions — fully typed against TRow. */
  columns: GridColDef<TRow>[];
  /** Row data. */
  rows: TRow[];
  /** Unique field used as row id. Defaults to "id". */
  getRowId?: (row: TRow) => GridRowId;

  // --- Loading & empty state ---
  /** Shows the built-in loading overlay when true. */
  loading?: boolean;
  /** Message shown when rows array is empty. Defaults to "Nenhum resultado encontrado." */
  emptyMessage?: string;
  /** Custom empty-state component. Overrides emptyMessage when provided. */
  emptySlot?: React.ReactNode;

  // --- Selection ---
  /** Enable checkbox selection. Defaults to false. */
  checkboxSelection?: boolean;
  /** Controlled selection state. */
  rowSelectionModel?: GridRowSelectionModel;
  /** Called when the selection changes. */
  onRowSelectionModelChange?: (model: GridRowSelectionModel) => void;

  // --- Pagination ---
  /** Pagination configuration. When omitted the grid uses built-in uncontrolled pagination. */
  pagination?: DataTablePaginationOptions;

  // --- Sorting ---
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;

  // --- Filtering ---
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;

  // --- Layout ---
  /** Row height in pixels. Defaults to 52. */
  rowHeight?: number;
  /** Table density. */
  density?: GridDensity;
  /** When true the grid expands to fit all rows without a scrollbar. */
  autoHeight?: boolean;
  /** MUI sx prop for custom styling. */
  sx?: SxProps<Theme>;

  // --- Toolbar ---
  /** Custom toolbar component rendered above the grid. */
  toolbar?: React.JSXElementConstructor<object>;
  /** Extra props forwarded to the toolbar component. */
  toolbarProps?: Record<string, unknown>;

  // --- Server-side mode ---
  /**
   * When true, sorting and filtering are delegated to the server.
   * You must handle onSortModelChange / onFilterModelChange yourself.
   */
  serverSide?: boolean;

  // --- Misc ---
  /** Total record count shown in a footer below the grid. */
  total?: number;
}

// ---------------------------------------------------------------------------
// Empty-state overlay
// ---------------------------------------------------------------------------

function DefaultEmptyOverlay({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<TRow extends GridValidRowModel>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyMessage = "Nenhum resultado encontrado.",
  emptySlot,
  checkboxSelection = false,
  rowSelectionModel,
  onRowSelectionModelChange,
  pagination,
  sortModel,
  onSortModelChange,
  filterModel,
  onFilterModelChange,
  rowHeight = 52,
  density = "standard",
  autoHeight = true,
  sx,
  toolbar,
  toolbarProps,
  serverSide = false,
  total,
}: DataTableProps<TRow>) {
  const noRowsOverlay = React.useCallback(
    () =>
      emptySlot ? (
        <>{emptySlot}</>
      ) : (
        <DefaultEmptyOverlay message={emptyMessage} />
      ),
    [emptySlot, emptyMessage],
  );

  const slots: Partial<GridSlots> = {
    noRowsOverlay,
    ...(toolbar ? { toolbar } : {}),
  };

  const slotProps =
    toolbar && toolbarProps ? { toolbar: toolbarProps as any } : {};

  return (
    <>
      <DataGrid<TRow>
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        // Data
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        // Loading
        loading={loading}
        // Empty state
        slots={slots}
        slotProps={slotProps}
        // Selection
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={onRowSelectionModelChange}
        // Pagination
        pagination
        paginationMode={serverSide ? "server" : "client"}
        paginationModel={pagination?.model}
        onPaginationModelChange={pagination?.onModelChange}
        rowCount={pagination?.rowCount}
        pageSizeOptions={pagination?.pageSizeOptions ?? [10, 25, 50]}
        // Sorting
        sortingMode={serverSide ? "server" : "client"}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        // Filtering
        filterMode={serverSide ? "server" : "client"}
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        disableColumnSorting
        disableColumnMenu
        // Layout
        rowHeight={rowHeight}
        density={density}
        autoHeight={autoHeight}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "transparent" },
          "& .MuiDataGrid-cell:focus": { outline: "none" },
          "& .MuiDataGrid-cell:focus-within": { outline: "none" },
          ...((sx as object) ?? {}),
        }}
      />
      {total !== undefined && (
        <p className="text-sm text-muted-foreground font-bold px-2 pt-1">
          {total} {total === 1 ? "registro" : "registros"} no total
        </p>
      )}
    </>
  );
}
