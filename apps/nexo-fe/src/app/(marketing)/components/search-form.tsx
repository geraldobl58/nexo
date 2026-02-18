import { House, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SectionForm = () => {
  return (
    <div className="bg-white p-4 rounded-2xl space-y-6 shadow-xs max-w-3xl w-full">
      <div className="flex space-x-5 border-b pb-4">
        <Button variant="link" className="text-primary underline">
          Alugar
        </Button>
        <Button variant="link" className="text-muted-foreground">
          Comprar
        </Button>
        <Button variant="link" className="text-muted-foreground">
          Vender
        </Button>
      </div>

      <form>
        <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-4 space-y-4 md:space-y-0">
          <Input
            startIcon={<Search className="size-5" />}
            placeholder="Cidade, bairro ou endereço"
            className="h-14 w-80 rounded-2xl font-medium bg-primary/3"
          />
          <Select>
            <SelectTrigger
              startIcon={<House className="size-5" />}
              className="w-full h-14 rounded-2xl font-medium"
            >
              <SelectValue placeholder="Tipo de imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-14 rounded-2xl font-bold w-[400px]">
            <Search className="size-5" />
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};
