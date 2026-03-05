"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { DataTable } from "@/components/ui/data-table";
import { useMyListings } from "@/features/owner/hooks/use-my-listings";
import {
  CreatePublishResponse,
  MyListingsQueryParams,
} from "@/features/owner/types/publish-types";

import { listingColumns } from "./columns";
import { FormField } from "@/components/ui/form-field/form-field";
import { Button } from "@mui/material";
import { SelectControl } from "@/components/ui/select-control/select-control";
import { Listing, Purpose } from "../enums/publish-details-enums";

// ---------------------------------------------------------------------------
// Filter form — all fields are optional, no zod validation needed
// ---------------------------------------------------------------------------

interface FilterFormValues {
  search: string;
  status: string;
  purpose: string;
}

export const MyProperties = () => {
  // Committed query params sent to the API (updated only on submit)
  const [filters, setFilters] = useState<MyListingsQueryParams>({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { listings, total, isLoading } = useMyListings({
    ...filters,
    page: paginationModel.page + 1, // DataGrid uses 0-based, API uses 1-based
    limit: paginationModel.pageSize,
  });

  const { control, handleSubmit, reset, watch } = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
      status: "",
      purpose: "",
    },
  });

  function onSearch(data: FilterFormValues) {
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // reset to first page
    setFilters({
      search: data.search || undefined,
      status: (data.status as MyListingsQueryParams["status"]) || undefined,
      purpose: data.purpose || undefined,
    });
  }

  const formValues = watch();
  const hasFilter = Object.values(formValues).some(
    (v) => v !== "" && v != null,
  );

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit(onSearch)}
        className="flex flex-row items-center gap-4 bg-primary/5 p-4 rounded"
      >
        <div className="flex-[2]">
          <FormField
            control={control}
            name="search"
            label="Buscar por título, cidade ou bairro"
            type="text"
            size="small"
            disabled={false}
          />
        </div>
        <div className="flex-1">
          <SelectControl
            control={control}
            name="status"
            size="small"
            label="Status"
            options={[
              { value: Listing.ACTIVE, label: "Ativo" },
              { value: Listing.INACTIVE, label: "Inativo" },
              { value: Listing.DRAFT, label: "Rascunho" },
              { value: Listing.RENTED, label: "Alugado" },
              { value: Listing.SOLD, label: "Vendido" },
            ]}
          />
        </div>
        <div className="flex-1">
          <SelectControl
            control={control}
            name="purpose"
            size="small"
            label="Finalidade"
            options={[
              { value: Purpose.SALE, label: "Venda" },
              { value: Purpose.RENT, label: "Aluguel" },
            ]}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !hasFilter}
          variant="contained"
        >
          Pesquisar
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="info"
          onClick={() => {
            reset();
            setFilters({});
            setPaginationModel({ page: 0, pageSize: 10 });
          }}
        >
          Limpar
        </Button>
      </form>

      <div className="bg-primary/5 p-4 rounded">
        <DataTable<CreatePublishResponse>
          columns={listingColumns}
          rows={listings}
          loading={isLoading}
          rowHeight={120}
          emptyMessage="Você ainda não cadastrou nenhum imóvel."
          pagination={{
            model: paginationModel,
            onModelChange: setPaginationModel,
            pageSizeOptions: [10, 25, 50],
          }}
          total={total}
        />
      </div>
    </div>
  );
};
