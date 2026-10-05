// ==============================================================================
// UTILITÁRIOS DE MÁSCARAS E VALIDAÇÃO DE DOCUMENTOS BRASILEIROS
// ==============================================================================

/**
 * Remove qualquer caractere que não seja numérico.
 */
export function onlyNumbers(value: string = ""): string {
  return value.replace(/\D/g, "");
}

/**
 * Converte string para MAIÚSCULAS preservando integridade de digitação.
 */
export function toUpper(value: string = ""): string {
  return value.toUpperCase();
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCPF(value: string = ""): string {
  const digits = onlyNumbers(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/**
 * Validação rigorosa dos dígitos verificadores de CPF
 */
export function isValidCPF(cpf: string = ""): boolean {
  const clean = onlyNumbers(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // Bloqueia 111.111.111-11, etc.

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

/**
 * Aplica máscara de Telefone / WhatsApp: (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(value: string = ""): string {
  const digits = onlyNumbers(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export function maskCNPJ(value: string = ""): string {
  const digits = onlyNumbers(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/**
 * Validação rigorosa dos dígitos verificadores de CNPJ
 */
export function isValidCNPJ(cnpj: string = ""): boolean {
  const clean = onlyNumbers(cnpj);
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  const b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let n = 0;
  for (let i = 0; i < 12; i++) {
    n += parseInt(clean[i], 10) * b[i + 1];
  }
  n = 11 - (n % 11);
  n = n >= 10 ? 0 : n;
  if (parseInt(clean[12], 10) !== n) return false;

  n = 0;
  for (let i = 0; i <= 12; i++) {
    n += parseInt(clean[i], 10) * b[i];
  }
  n = 11 - (n % 11);
  n = n >= 10 ? 0 : n;
  if (parseInt(clean[13], 10) !== n) return false;

  return true;
}

/**
 * Aplica máscara de data: DD/MM/AAAA
 */
export function maskDate(value: string = ""): string {
  const digits = onlyNumbers(value).slice(0, 8);
  return digits
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}
