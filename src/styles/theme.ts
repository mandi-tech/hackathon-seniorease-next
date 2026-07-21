export const primitivos = {
  // Cores do Guia de Estilo SeniorEase
  azulMarinho: "#1A2B48",
  azulClaro: "#0056D2",
  creme: "#F9F7F2",
  cinzaNeutro: "#777779",

  // Cores padrões/semânticas
  verde: "#166534",
  vermelho: "#991b1b",
  amarelo: "#854d0e",
  laranja: "#f97316",
  rosa: "#ec4899",

  // Cores adicionais para Dark Mode e Estados
  azulEscuro: "#60a5fa",
  verdeEscuro: "#4ade80",
  vermelhoEscuro: "#f87171",
  amareloEscuro: "#facc15",
  lavandaClaro: "#e0e7ff",
  lavandaEscuro: "#312e81",
  bordaClaro: "#e2e0db",
  cinzaClaro: "#F9F7F2",
  brancoSuave: "#ffffff",
  carvao: "#121212",
  cinzaEscuro: "#1e1e1e",
  grafite: "#2e2e2c",
};

export const paletaClara = {
  primaria: primitivos.azulClaro,
  "primaria-hover": "#0045a8",
  secundaria: primitivos.azulMarinho,
  "secundaria-hover": "#253b61",
  sucesso: primitivos.verde,
  perigo: primitivos.vermelho,
  alerta: primitivos.amarelo,
  destaque: primitivos.laranja,
  rosa: primitivos.rosa,
  lavanda: primitivos.lavandaClaro,
  borda: primitivos.bordaClaro,
  fundo: primitivos.cinzaClaro,
  "fundo-secundario": primitivos.brancoSuave,
  texto: primitivos.azulMarinho,
  "texto-secundario": primitivos.cinzaNeutro,
  card: primitivos.brancoSuave,
  suave: primitivos.cinzaNeutro,
};

export const paletaEscura = {
  primaria: primitivos.azulEscuro,
  "primaria-hover": "#93c5fd",
  secundaria: "#2dd4bf",
  "secundaria-hover": "#5eead4",
  sucesso: primitivos.verdeEscuro,
  perigo: primitivos.vermelhoEscuro,
  alerta: primitivos.amareloEscuro,
  destaque: primitivos.laranja,
  rosa: primitivos.rosa,
  lavanda: primitivos.lavandaEscuro,
  borda: primitivos.grafite,
  fundo: primitivos.carvao,
  "fundo-secundario": primitivos.cinzaEscuro,
  texto: "#f5f5f4",
  "texto-secundario": primitivos.brancoSuave,
  card: primitivos.cinzaEscuro,
  suave: "#a8a29e",
};

// Paleta de Alto Contraste do Guia de Estilo (Preto Puro + Branco/Amarelo)
export const paletaAltoContraste = {
  primaria: "#ffff00" /* Amarelo Puro */,
  "primaria-hover": "#ffea00",
  secundaria: "#ffffff" /* Branco Puro */,
  "secundaria-hover": "#e5e5e5",
  sucesso: "#00ff00",
  perigo: "#ff0000",
  alerta: "#ffff00",
  destaque: "#ffff00",
  rosa: "#ffffff",
  lavanda: "#ffffff",
  borda: "#ffffff",
  fundo: "#000000" /* Preto Puro */,
  "fundo-secundario": "#1c1b1bff",
  texto: "#ffffff",
  "texto-secundario": "#ffff00",
  card: "#000000",
  suave: "#ffff00" /* Amarelo para status/links */,
};

/* ==========================================
   ESCALAS DE FONTES (ACESSIBILIDADE)
   ========================================== */
export const tamanhoPadrao = {
  titulo1: "32px",
  titulo2: "24px",
  titulo3: "20px",
  paragrafo: "16px",
};

export const tamanhoGrande = {
  titulo1: "36px",
  titulo2: "28px",
  titulo3: "24px",
  paragrafo: "20px",
};

export const tamanhoMuitoGrande = {
  titulo1: "40px",
  titulo2: "32px",
  titulo3: "28px",
  paragrafo: "24px",
};

export const getDynamicThemeStyles = () => {
  const objectToCss = (obj: Record<string, string>, prefix = "--theme-") =>
    Object.entries(obj)
      .map(([key, val]) => `${prefix}${key}: ${val};`)
      .join(" ");

  return `
    :root {
      ${objectToCss(paletaClara)}
      ${objectToCss(tamanhoPadrao)}
    }
    
    html[data-font-size="large"] {
      ${objectToCss(tamanhoGrande)}
    }
    
    html[data-font-size="extra-large"] {
      ${objectToCss(tamanhoMuitoGrande)}
    }
    
    @media (prefers-color-scheme: dark) {
      html:not([data-contrast="high"]) {
        ${objectToCss(paletaEscura)}
      }
    }
    
    @media (prefers-contrast: more) {
      :root {
        ${objectToCss(paletaAltoContraste)}
      }
    }
    
    html[data-contrast="high"] {
      ${objectToCss(paletaAltoContraste)}
    }
  `;
};

export const tailwindColors = Object.keys(paletaClara).reduce(
  (acc, key) => {
    acc[key] = `var(--theme-${key})`;
    return acc;
  },
  {} as Record<string, string>,
);
