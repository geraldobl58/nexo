"use client";

import { Button, Chip, Divider } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { usePublish } from "../context/publish-context";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function currency(value?: number) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function Section({ title, onEdit, children }: SectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between rounded-lg p-4 bg-primary/5">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditOutlinedIcon fontSize="small" />}
          onClick={onEdit}
          className="!text-xs"
        >
          Editar
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value?: string | number | null;
}

function Field({ label, value }: FieldProps) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col space-y-2 gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-4">
        {label}
      </span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const StepFinished = () => {
  const { formData, goToStep } = usePublish();
  const { location, details, comodities } = formData;

  const locationAddress = [location.street, location.streetNumber]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-6 mt-10 shadow-md bg-white">
      <h3 className="text-2xl font-bold">Revisão e publicação</h3>
      <p className="text-sm text-muted-foreground -mt-2">
        Revise as informações antes de publicar o imóvel. Clique em{" "}
        <strong>Editar</strong> para alterar qualquer seção.
      </p>

      {/* ── Localização ─────────────────────────────────────────── */}
      <Section title="Localização do imóvel" onEdit={() => goToStep(0)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
          {locationAddress && (
            <Field label="Endereço" value={locationAddress} />
          )}
          <Field label="Complemento" value={location.complement} />
          <Field label="Bairro" value={location.district} />
          <Field label="Cidade" value={location.city} />
          <Field label="Estado" value={location.state} />
          <Field label="CEP" value={location.zipcode} />
        </div>
      </Section>

      {/* ── Detalhes ─────────────────────────────────────────────── */}
      <Section title="Detalhes do imóvel" onEdit={() => goToStep(1)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
            <Field label="Finalidade" value={details.purpose} />
            <Field label="Categoria" value={details.type} />
            <Field label="Preço" value={currency(details.price)} />
            <Field
              label="Condomínio"
              value={currency(details.condominiumFee)}
            />
            <Field label="IPTU Anual" value={currency(details.iptuYearly)} />
          </div>
          {details.title && (
            <>
              <Divider />
              <Field label="Título" value={details.title} />
            </>
          )}
          {details.description && (
            <>
              <Divider />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Descrição
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {details.description}
                </p>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* ── Comodidades ──────────────────────────────────────────── */}
      <Section title="Comodidades do imóvel" onEdit={() => goToStep(3)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
            <Field label="Área (m²)" value={comodities.areaM2} />
            <Field label="Área construída (m²)" value={comodities.builtArea} />
            <Field label="Quartos" value={comodities.bedrooms} />
            <Field label="Suítes" value={comodities.suites} />
            <Field label="Banheiros" value={comodities.bathrooms} />
            <Field label="Vagas de garagem" value={comodities.garageSpots} />
            <Field label="Andar" value={comodities.floor} />
            <Field label="Total de andares" value={comodities.totalFloors} />
            <Field label="Ano de construção" value={comodities.yearBuilt} />
          </div>

          {(() => {
            const flags: { label: string; value?: boolean }[] = [
              { label: "Mobiliado", value: comodities.furnished },
              { label: "Aceita animais", value: comodities.petFriendly },
              { label: "Aceita troca", value: comodities.acceptsExchange },
              {
                label: "Aceita financiamento",
                value: comodities.acceptsFinancing,
              },
              { label: "Aceita veículo", value: comodities.acceptsCarTrade },
              { label: "Lançamento", value: comodities.isLaunch },
              { label: "Pronto para morar", value: comodities.isReadyToMove },
            ].filter((f) => f.value !== undefined && f.value !== null);

            if (!flags.length) return null;

            return (
              <>
                <Divider />
                <div className="flex flex-wrap gap-2">
                  {flags.map((f) => (
                    <Chip key={f.label} label={f.label} color="primary" />
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </Section>
    </div>
  );
};
