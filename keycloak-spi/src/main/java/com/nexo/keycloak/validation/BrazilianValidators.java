package com.nexo.keycloak.validation;

import java.util.regex.Pattern;

/**
 * Validadores específicos para dados brasileiros (CPF, Telefone)
 * 
 * Esta classe fornece validação robusta de documentos e telefones brasileiros,
 * incluindo verificação de dígitos verificadores para CPF.
 */
public class BrazilianValidators {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\(\\d{2}\\)\\s?\\d{4,5}-?\\d{4}$");
    private static final Pattern CPF_DIGITS_ONLY = Pattern.compile("^\\d{11}$");

    /**
     * Valida formato de telefone brasileiro
     * Aceita: (11) 98765-4321 (celular) ou (11) 3456-7890 (fixo)
     * 
     * @param phone Telefone formatado
     * @return true se válido
     */
    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    /**
     * Valida CPF brasileiro com dígitos verificadores
     * 
     * Algoritmo:
     * 1. Remove formatação (apenas dígitos)
     * 2. Verifica se tem 11 dígitos
     * 3. Rejeita CPFs conhecidos como inválidos (111.111.111-11, etc)
     * 4. Calcula e valida primeiro dígito verificador
     * 5. Calcula e valida segundo dígito verificador
     * 
     * @param cpf CPF formatado (000.000.000-00) ou apenas dígitos
     * @return true se CPF for válido
     */
    public static boolean isValidCPF(String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            return false;
        }

        // Remove formatação
        cpf = cpf.replaceAll("[.\\-]", "");

        // Verifica se tem 11 dígitos
        if (!CPF_DIGITS_ONLY.matcher(cpf).matches()) {
            return false;
        }

        // Rejeita CPFs conhecidos como inválidos
        if (cpf.equals("00000000000") || cpf.equals("11111111111") ||
            cpf.equals("22222222222") || cpf.equals("33333333333") ||
            cpf.equals("44444444444") || cpf.equals("55555555555") ||
            cpf.equals("66666666666") || cpf.equals("77777777777") ||
            cpf.equals("88888888888") || cpf.equals("99999999999")) {
            return false;
        }

        // Calcula primeiro dígito verificador
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        int firstDigit = 11 - (sum % 11);
        if (firstDigit >= 10) firstDigit = 0;

        if (Character.getNumericValue(cpf.charAt(9)) != firstDigit) {
            return false;
        }

        // Calcula segundo dígito verificador
        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        int secondDigit = 11 - (sum % 11);
        if (secondDigit >= 10) secondDigit = 0;

        return Character.getNumericValue(cpf.charAt(10)) == secondDigit;
    }

    /**
     * Remove formatação do CPF (mantém apenas dígitos)
     * Útil para armazenar no banco de dados
     * 
     * @param cpf CPF formatado
     * @return CPF apenas com dígitos
     */
    public static String normalizeCPF(String cpf) {
        if (cpf == null) return null;
        return cpf.replaceAll("[.\\-]", "");
    }

    /**
     * Remove formatação do telefone (mantém apenas dígitos)
     * 
     * @param phone Telefone formatado
     * @return Telefone apenas com dígitos
     */
    public static String normalizePhone(String phone) {
        if (phone == null) return null;
        return phone.replaceAll("[()\\s\\-]", "");
    }
}
