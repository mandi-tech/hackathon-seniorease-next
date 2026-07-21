"use client";

import React, { useEffect, useState } from "react";
import { App, ConfigProvider, theme as antdTheme } from "antd";
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
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkThemeAndA11y = () => {
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

      const fontAttr = document.documentElement.getAttribute(
        "data-font-size",
      ) as FontSizeScale;
      if (fontAttr) setFontSizeScale(fontAttr);

      const spacingAttr = document.documentElement.getAttribute(
        "data-spacing",
      ) as SpacingScale;
      if (spacingAttr) setSpacingScale(spacingAttr);
    };

    checkThemeAndA11y();

    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
    darkMediaQuery.addEventListener("change", checkThemeAndA11y);
    contrastMediaQuery.addEventListener("change", checkThemeAndA11y);

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
  }, [mounted]);

  const getThemeConfig = (
    mode: ThemeMode,
    fontScale: FontSizeScale,
    spacing: SpacingScale,
  ): ThemeConfig => {
    const isDark = mode === "dark";
    const algorithm = isDark
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm;

    const tokenCores =
      mode === "high-contrast"
        ? paletaAltoContraste
        : isDark
          ? paletaEscura
          : paletaClara;

    let fontTokens = {
      fontSize: 16,
      fontSizeHeading1: 32,
      fontSizeHeading2: 24,
      fontSizeHeading3: 20,
    };

    if (fontScale === "small") {
      fontTokens = {
        fontSize: 14,
        fontSizeHeading1: 28,
        fontSizeHeading2: 20,
        fontSizeHeading3: 18,
      };
    } else if (fontScale === "large") {
      fontTokens = {
        fontSize: 20,
        fontSizeHeading1: 40,
        fontSizeHeading2: 30,
        fontSizeHeading3: 24,
      };
    }

    let spacingTokens = {
      margin: 16,
      padding: 16,
      paddingLG: 24,
      controlHeight: 40,
    };

    if (spacing === "compact") {
      spacingTokens = {
        margin: 8,
        padding: 8,
        paddingLG: 16,
        controlHeight: 32,
      };
    } else if (spacing === "spacious") {
      spacingTokens = {
        margin: 24,
        padding: 24,
        paddingLG: 32,
        controlHeight: 48,
      };
    }

    let configComponents = {};
    let configCalendar = {};

    if (mode === "high-contrast") {
      configComponents = {
        Card: {
          colorBgContainer: paletaAltoContraste.fundo,
          colorText: paletaAltoContraste.texto,
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
