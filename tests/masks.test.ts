import { describe, it, expect } from "vitest";
import {
  maskCPF,
  maskPhone,
  maskCNPJ,
  maskDate,
  isValidCPF,
  isValidCNPJ,
  toUpper,
} from "../lib/utils/masks";

describe("Máscaras de Entrada e Validadores Oficiais", () => {
  it("deve formatar CPF corretamente", () => {
    expect(maskCPF("12345678901")).toBe("123.456.789-01");
  });

  it("deve validar algoritmo de CPF com precisão", () => {
    // Sequências iguais são inválidas
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("00000000000")).toBe(false);
    // CPF real de teste com dígito correto: 52998224725
    expect(isValidCPF("52998224725")).toBe(true);
  });

  it("deve formatar WhatsApp celular (11 dígitos)", () => {
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("deve formatar CNPJ corretamente", () => {
    expect(maskCNPJ("12345678000195")).toBe("12.345.678/0001-95");
  });

  it("deve validar CNPJ com precisão matemática", () => {
    expect(isValidCNPJ("11111111111111")).toBe(false);
    // CNPJ real de teste: 11.222.333/0001-81
    expect(isValidCNPJ("11222333000181")).toBe(true);
  });

  it("deve formatar data DD/MM/AAAA", () => {
    expect(maskDate("05102026")).toBe("05/10/2026");
  });

  it("deve converter textos para maiúsculas (UPPERCASE)", () => {
    expect(toUpper("juliana ótica modelo")).toBe("JULIANA ÓTICA MODELO");
  });
});
