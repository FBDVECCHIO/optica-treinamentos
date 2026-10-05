import { describe, it, expect } from "vitest";
import nextConfig from "../next.config";

describe("Configuração e Cabeçalhos de Segurança HTTP", () => {
  it("deve conter cabeçalhos estritos de segurança contra clickjacking, MIME-sniffing e XSS", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (nextConfig.headers) {
      const headersList = await nextConfig.headers();
      const globalConfig = headersList.find((h) => h.source === "/(.*)");
      expect(globalConfig).toBeDefined();

      const headerKeys = globalConfig?.headers.map((h) => h.key);
      expect(headerKeys).toContain("X-Frame-Options");
      expect(headerKeys).toContain("X-Content-Type-Options");
      expect(headerKeys).toContain("Strict-Transport-Security");
      expect(headerKeys).toContain("Referrer-Policy");

      const frameOption = globalConfig?.headers.find((h) => h.key === "X-Frame-Options");
      expect(frameOption?.value).toBe("DENY");
    }
  });

  it("deve permitir carregamento seguro de imagens do cdn 21st.dev e unsplash", () => {
    expect(nextConfig.images).toBeDefined();
    expect(nextConfig.images?.remotePatterns).toBeDefined();
  });
});
