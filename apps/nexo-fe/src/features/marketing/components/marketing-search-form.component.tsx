"use client";

import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";

import { House, Search } from "lucide-react";
import { FormField } from "../../../components/ui/form-field/form-field";
import { useForm } from "react-hook-form";
import { SelectControl } from "@/components/ui/select-control/select-control";
import { useRouter } from "next/navigation";

export const MarketingSearchForm = () => {
  const router = useRouter();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      propertyType: "",
      search: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form data:", data);

    // Simula uma busca e redireciona para a página de resultados
    const query = new URLSearchParams();
    if (data.propertyType) query.append("type", data.propertyType);
    if (data.search) query.append("q", data.search);

    router.push(`/search?${query.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-2xl space-y-6 shadow-xs w-full max-w-6xl">
      <div className="flex space-x-1 border-b pb-4">
        <Button
          variant="text"
          className="!normal-case !font-semibold !underline"
        >
          Alugar
        </Button>
        <Button
          variant="text"
          color="inherit"
          className="!normal-case !text-slate-500"
        >
          Comprar
        </Button>
        <Button
          variant="text"
          color="inherit"
          className="!normal-case !text-slate-500"
        >
          Imóveis Novo
        </Button>
        <Button
          variant="text"
          color="inherit"
          className="!normal-case !text-slate-500"
        >
          Leilões
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* <FormControl className="w-full">
            <Select
              displayEmpty
              value=""
              onChange={() => {}}
              input={<OutlinedInput />}
              startAdornment={
                <InputAdornment position="start">
                  <House size={18} color="#94a3b8" />
                </InputAdornment>
              }
              renderValue={(val) =>
                val ? (
                  String(val)
                ) : (
                  <span className="text-slate-400 text-sm">Tipo de imóvel</span>
                )
              }
            >
              <div>
                <div className="flex items-center justify-between w-full px-4 text-xs">
                  <span className="text-gray-400">Apartamentos</span>
                  <span className="flex items-center justify-center bg-primary text-white font-bold rounded-full w-5 h-5 text-[10px]">
                    5
                  </span>
                </div>
              </div>
              <MenuItem value="apartamento">Apartamentos</MenuItem>
              <MenuItem value="cobertura">Cobertura</MenuItem>
              <MenuItem value="flat">Flat</MenuItem>
              <MenuItem value="kitnet">Kitnet</MenuItem>
              <MenuItem value="loft">Loft</MenuItem>

              <div>
                <div className="flex items-center justify-between w-full px-4 text-xs">
                  <span className="text-gray-400">Casas</span>
                  <span className="flex items-center justify-center bg-primary text-white font-bold rounded-full w-5 h-5 text-[10px]">
                    3
                  </span>
                </div>
              </div>
              <MenuItem value="casa">Casa</MenuItem>
              <MenuItem value="sobrado">Sobrado</MenuItem>
              <MenuItem value="condominio">Condomínio</MenuItem>

              <div>
                <div className="flex items-center justify-between w-full px-4 text-xs">
                  <span className="text-gray-400">Terrenos</span>
                  <span className="flex items-center justify-center bg-primary text-white font-bold rounded-full w-5 h-5 text-[10px]">
                    3
                  </span>
                </div>
              </div>
              <MenuItem value="terreno">Rurais</MenuItem>

              <div>
                <div className="flex items-center justify-between w-full px-4 text-xs">
                  <span className="text-gray-400">Comerciais</span>
                  <span className="flex items-center justify-center bg-primary text-white font-bold rounded-full w-5 h-5 text-[10px]">
                    3
                  </span>
                </div>
              </div>
              <MenuItem value="comercial">Imóveis Comerciais</MenuItem>
            </Select>
          </FormControl> */}

          <SelectControl
            control={control}
            name="propertyType"
            label="Tipo de imóvel"
            options={[
              { value: "apartamento", label: "Apartamento" },
              { value: "casa", label: "Casa" },
              { value: "terreno", label: "Terreno" },
              { value: "comercial", label: "Comercial" },
            ]}
          />

          <FormField
            control={control}
            name="search"
            label="Localização, bairro, cidade ou CEP"
            placeholder="Digite a localização desejada"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <House size={18} color="#94a3b8" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            size="large"
            variant="contained"
            startIcon={<Search size={18} />}
            className="w-full md:!w-auto !h-14 !normal-case !font-bold !shadow-none hover:!shadow-none"
          >
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};
