"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { useMyListings } from "@/features/owner/hooks/use-my-listings.hook";
import {
  CreatePublishResponse,
  MyListingsQueryParams,
} from "@/features/owner/types/publish.type";

import { listingColumns } from "./columns";
import { FormField } from "@/components/ui/form-field/form-field";
import { Button, Tooltip } from "@mui/material";
import Link from "next/link";
import { SelectControl } from "@/components/ui/select-control/select-control";
import { Listing, Purpose } from "../enums/listing.enum";

// ---------------------------------------------------------------------------
// Filter form — all fields are optional, no zod validation needed
// ---------------------------------------------------------------------------

interface FilterFormValues {
  search: string;
  status: string;
  purpose: string;
}

export const MyProperties = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to push the current filter+pagination state to the URL
  const pushToUrl = useCallback(
    (params: MyListingsQueryParams, page: number, pageSize: number) => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.status) sp.set("status", params.status);
      if (params.purpose) sp.set("purpose", params.purpose);
      if (page > 0) sp.set("page", String(page));
      if (pageSize !== 10) sp.set("pageSize", String(pageSize));
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router],
  );

  // Committed query params sent to the API — initialised from URL
  const [filters, setFilters] = useState<MyListingsQueryParams>(() => ({
    search: searchParams.get("search") ?? undefined,
    status:
      (searchParams.get("status") as MyListingsQueryParams["status"]) ??
      undefined,
    purpose: searchParams.get("purpose") ?? undefined,
  }));

  const [paginationModel, setPaginationModel] = useState(() => ({
    page: parseInt(searchParams.get("page") ?? "0"),
    pageSize: parseInt(searchParams.get("pageSize") ?? "10"),
  }));

  const { listings, total, isLoading, isAtFreeLimit } = useMyListings({
    ...filters,
    page: paginationModel.page + 1, // DataGrid uses 0-based, API uses 1-based
    limit: paginationModel.pageSize,
  });

  const { control, handleSubmit, reset, watch } = useForm<FilterFormValues>({
    defaultValues: {
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      purpose: searchParams.get("purpose") ?? "",
    },
  });

  function onSearch(data: FilterFormValues) {
    const newFilters: MyListingsQueryParams = {
      search: data.search || undefined,
      status: (data.status as MyListingsQueryParams["status"]) || undefined,
      purpose: data.purpose || undefined,
    };
    const newPage = 0;
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
    setFilters(newFilters);
    pushToUrl(newFilters, newPage, paginationModel.pageSize);
  }

  function handlePaginationChange(model: { page: number; pageSize: number }) {
    setPaginationModel(model);
    pushToUrl(filters, model.page, model.pageSize);
  }

  const formValues = watch();
  const hasFilter = Object.values(formValues).some(
    (v) => v !== "" && v != null,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header: título + botão novo imóvel */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Meus imóveis</h2>
        <Tooltip
          title={
            isAtFreeLimit
              ? "Plano FREE: limite de 1 imóvel atingido. Faça upgrade para anunciar mais."
              : ""
          }
          arrow
        >
          {/* span necessário para o Tooltip funcionar em botão desabilitado */}
          <span>
            <Button
              variant="contained"
              component={Link}
              href="/publish/owner"
              disabled={isAtFreeLimit}
            >
              + Novo imóvel
            </Button>
          </span>
        </Tooltip>
      </div>
      <div>
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
              pushToUrl({}, 0, 10);
            }}
          >
            Limpar
          </Button>
        </form>
      </div>

      <div className="bg-primary/5 p-4 rounded">
        <DataTable<CreatePublishResponse>
          columns={listingColumns}
          rows={listings}
          loading={isLoading}
          rowHeight={120}
          emptyMessage="Você ainda não cadastrou nenhum imóvel."
          pagination={{
            model: paginationModel,
            onModelChange: handlePaginationChange,
            pageSizeOptions: [10, 25, 50],
          }}
          total={total}
        />
      </div>
    </div>
  );
};
