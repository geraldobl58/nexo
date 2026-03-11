export type BrasilApiCepResponse = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  location?: {
    coordinates?: {
      latitude?: string | number;
      longitude?: string | number;
    };
  };
};

export type StepLocationProps = {
  /** Chamado sempre que a validade do formulário muda */
  onValidChange?: (isValid: boolean) => void;
};
