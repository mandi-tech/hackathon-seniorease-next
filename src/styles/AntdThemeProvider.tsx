"use client";

import React, { useEffect, useState } from "react";
import { App, ConfigProvider, DatePicker, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";
import ptBR from "antd/locale/pt_BR";
import {
  paletaClara,
  paletaEscura,
  paletaAltoContraste,
} from "@/src/styles/theme";

type ThemeMode = "light" | "dark" | "high-contrast";
type FontSizeScale = "small" | "medium" | "large";
type SpacingScale = "compact" | "normal" | "spacious";

export default function AntdThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>("medium");
  const [spacingScale, setSpacingScale] = useState<SpacingScale>("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkThemeAndA11y = () => {
      // --- Lógica de Contraste e Tema ---
      const isHighContrastAttr =
        document.documentElement.getAttribute("data-contrast") === "high";
      const prefersContrast = window.matchMedia(
        "(prefers-contrast: more)",
      ).matches;
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      if (isHighContrastAttr || prefersContrast) {
        setThemeMode("high-contrast");
      } else if (prefersDark) {
        setThemeMode("dark");
      } else {
        setThemeMode("light");
      }

      // --- Lógica de Tamanho de Fonte Dinâmico ---
      const fontAttr = document.documentElement.getAttribute(
        "data-font-size",
      ) as FontSizeScale;
      if (fontAttr) setFontSizeScale(fontAttr);

      // --- Lógica de Espaçamento Dinâmico ---
      const spacingAttr = document.documentElement.getAttribute(
        "data-spacing",
      ) as SpacingScale;
      if (spacingAttr) setSpacingScale(spacingAttr);
    };

    checkThemeAndA11y();

    // Media Queries listeners
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
    darkMediaQuery.addEventListener("change", checkThemeAndA11y);
    contrastMediaQuery.addEventListener("change", checkThemeAndA11y);

    // Observer para escutar as mudanças de atributos no HTML feito por botões de acessibilidade
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "data-contrast" ||
          mutation.attributeName === "data-font-size" ||
          mutation.attributeName === "data-spacing"
        ) {
          checkThemeAndA11y();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-contrast", "data-font-size", "data-spacing"],
    });

    return () => {
      darkMediaQuery.removeEventListener("change", checkThemeAndA11y);
      contrastMediaQuery.removeEventListener("change", checkThemeAndA11y);
      observer.disconnect();
    };
  }, []);

  // Função auxiliar para calcular os tamanhos de fonte do AntD baseado na escala
  const getFontTokens = (scale: FontSizeScale) => {
    const baseSizes = {
      small: { fontSize: 12, fontSizeLG: 14, fontSizeSM: 11, fontSizeXL: 16 },
      medium: { fontSize: 14, fontSizeLG: 16, fontSizeSM: 12, fontSizeXL: 20 },
      large: { fontSize: 18, fontSizeLG: 20, fontSizeSM: 16, fontSizeXL: 24 },
    };
    return baseSizes[scale];
  };

  // Função auxiliar para injetar modificadores de espaçamento e padding
  const getSpacingTokens = (scale: SpacingScale) => {
    // ControlHeight dita a altura de inputs e botões, paddingContent e margin mudam os respiros internos
    switch (scale) {
      case "compact":
        return { padding: 8, margin: 8, controlHeight: 28 };
      case "spacious":
        return { padding: 20, margin: 20, controlHeight: 45 };
      case "normal":
      default:
        return { padding: 16, margin: 16, controlHeight: 32 };
    }
  };

  const getThemeConfig = (
    mode: ThemeMode,
    fontScale: FontSizeScale,
    spaceScale: SpacingScale,
  ): ThemeConfig => {
    // 1. Obtém os tokens de acessibilidade computados
    const fontTokens = getFontTokens(fontScale);
    const spacingTokens = getSpacingTokens(spaceScale);
    let configCalendar = {};
    let configComponents = {};

    // 2. Mapeamento base da paleta de cores
    let tokenCores = {
      colorPrimary: paletaClara.primaria,
      colorSuccess: paletaClara.sucesso,
      colorError: paletaClara.perigo,
      colorWarning: paletaClara.alerta,
    };
    let algorithm = antdTheme.defaultAlgorithm;

    if (mode === "dark") {
      algorithm = antdTheme.darkAlgorithm;
      tokenCores = {
        colorPrimary: paletaEscura.primaria,
        colorSuccess: paletaEscura.sucesso,
        colorError: paletaEscura.perigo,
        colorWarning: paletaEscura.alerta,
      };
    } else if (mode === "high-contrast") {
      algorithm = antdTheme.darkAlgorithm;

      tokenCores = {
        colorPrimary: paletaAltoContraste.primaria,
        colorSuccess: paletaAltoContraste.sucesso,
        colorError: paletaAltoContraste.perigo,
        colorWarning: paletaAltoContraste.alerta,
      };
      configComponents = {
        Input: {
          colorTextLightSolid: paletaAltoContraste.fundo,
          colorText: paletaAltoContraste.texto,
          colorTextPlaceholder: paletaAltoContraste.texto,
          colorTextHeading: paletaAltoContraste.fundo,
        },
        Button: {
          primaryColor: paletaAltoContraste.fundo,
        },
        DatePicker: {
          colorTextLightSolid: paletaAltoContraste.fundo,
          colorText: paletaAltoContraste.texto,
          colorTextPlaceholder: paletaAltoContraste.texto,
          colorTextHeading: paletaAltoContraste.fundo,
        },
        Select: {
          colorTextLightSolid: paletaAltoContraste.fundo,
          colorText: paletaAltoContraste.texto,
          colorTextPlaceholder: paletaAltoContraste.texto,
        },
      };
      configCalendar = { colorTextLightSolid: paletaAltoContraste.fundo };
    }

    return {
      algorithm,
      token: {
        ...tokenCores,
        fontFamily: "var(--font-sans)",
        // Injeta dinamicamente os tamanhos e espaçamentos calculados
        ...fontTokens,
        ...spacingTokens,
        ...(mode === "high-contrast" && {
          colorBgContainer: paletaAltoContraste.fundo,
          colorText: paletaAltoContraste.texto,
        }),
      },
      components: {
        Calendar: {
          fullBg: "transparent",
          ...configCalendar,
        },
        ...configComponents,
      },
    };
  };

  return (
    <ConfigProvider
      locale={ptBR}
      theme={getThemeConfig(
        mounted ? themeMode : "light",
        mounted ? fontSizeScale : "medium",
        mounted ? spacingScale : "normal",
      )}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
