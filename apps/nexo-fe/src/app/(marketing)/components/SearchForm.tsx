"use client";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { House, Search } from "lucide-react";

export const SectionForm = () => {
  return (
    <div className="bg-white p-4 rounded-2xl space-y-6 shadow-xs w-full max-w-3xl">
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
          Vender
        </Button>
      </div>

      <form>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <FormControl className="w-full md:!w-[220px]">
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
          </FormControl>

          <TextField
            variant="outlined"
            placeholder="Cidade, bairro ou endereço"
            className="w-full md:!w-[360px]"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#94a3b8" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant="contained"
            size="large"
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
