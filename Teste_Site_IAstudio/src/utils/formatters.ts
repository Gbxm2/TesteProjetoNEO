/**
 * Utilitários de formatação e validação de campos
 */

/**
 * Formata número de telefone brasileiro progressivamente (apenas dígitos)
 * Suporta formatos de 10 dígitos (fixo) e 11 dígitos (celular)
 * Exemplo: 15999999999 -> (15) 99999-9999
 */
export function formatPhone(value: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);
  
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Formata CPF progressivamente (apenas dígitos)
 * Exemplo: 12345678900 -> 123.456.789-00
 */
export function formatCpf(value: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export const formatCPF = formatCpf;

/**
 * Valida se um e-mail possui sintaxe válida (RFC 5322 básica)
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

/**
 * Valida se o telefone possui pelo menos 10 dígitos (DDD + número)
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}
