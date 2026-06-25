"use client";

import React, { useEffect, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";
import ptBR from "antd/locale/pt_BR";
import {
  paletaClara,
  paletaEscura,
  paletaAltoContraste,
} from "@/src/styles/theme";

type ThemeMode = "light" | "dark" | "high-contrast";

export default function AntdThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkTheme = () => {
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
    };

    checkTheme();

    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");

    darkMediaQuery.addEventListener("change", checkTheme);
    contrastMediaQuery.addEventListener("change", checkTheme);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-contrast") {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-contrast"],
    });

    return () => {
      darkMediaQuery.removeEventListener("change", checkTheme);
      contrastMediaQuery.removeEventListener("change", checkTheme);
      observer.disconnect();
    };
  }, []);

  const getThemeConfig = (mode: ThemeMode): ThemeConfig => {
    switch (mode) {
      case "dark":
        return {
          algorithm: antdTheme.darkAlgorithm,
          token: {
            colorPrimary: paletaEscura.primaria,
            colorSuccess: paletaEscura.sucesso,
            colorError: paletaEscura.perigo,
            colorWarning: paletaEscura.alerta,
            fontFamily: "var(--font-sans)",
          },
          components: {
            Calendar: {
              fullBg: " transparent",
            },
          },
        };
      case "high-contrast":
        return {
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: paletaAltoContraste.primaria,
            colorSuccess: paletaAltoContraste.sucesso,
            colorError: paletaAltoContraste.perigo,
            colorWarning: paletaAltoContraste.alerta,
            fontFamily: "var(--font-sans)",
            colorBgContainer: paletaAltoContraste.fundo,
            colorText: paletaAltoContraste.texto,
          },
          components: {
            Calendar: {
              fullBg: " transparent",
            },
          },
        };
      case "light":
      default:
        return {
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: paletaClara.primaria,
            colorSuccess: paletaClara.sucesso,
            colorError: paletaClara.perigo,
            colorWarning: paletaClara.alerta,
            fontFamily: "var(--font-sans)",
          },
          components: {
            Calendar: {
              fullBg: " transparent",
            },
          },
        };
    }
  };

  return (
    <ConfigProvider
      locale={ptBR}
      theme={getThemeConfig(mounted ? themeMode : "light")}
    >
      {children}
    </ConfigProvider>
  );
}
