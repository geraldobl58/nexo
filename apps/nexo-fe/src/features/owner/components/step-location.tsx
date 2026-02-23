import { TextField } from "@mui/material";

export const StepLocation = () => {
  return (
    <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 shadow-md bg-white">
      <h3 className="text-2xl font-bold">Localização do imóvel</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <TextField fullWidth variant="outlined" placeholder="00000-000" />
        <TextField
          fullWidth
          disabled
          variant="outlined"
          placeholder="Nome da rua"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <TextField fullWidth variant="outlined" placeholder="Número" />
        <TextField fullWidth variant="outlined" placeholder="Complemento" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <TextField fullWidth disabled variant="outlined" placeholder="Bairro" />
        <TextField fullWidth disabled variant="outlined" placeholder="Cidade" />
      </div>
      <div className="w-full">
        <TextField fullWidth disabled variant="outlined" placeholder="Estado" />
      </div>
      <div className="w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6999574.716951842!2d-105.36603012667372!3d31.060749778591102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864070360b823249%3A0x16eb1c8f1808de3c!2sTexas%2C%20EUA!5e0!3m2!1spt-BR!2sbr!4v1771885377807!5m2!1spt-BR!2sbr"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        ></iframe>
      </div>
    </div>
  );
};
