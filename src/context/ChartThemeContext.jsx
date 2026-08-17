import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";


const ChartThemeContext =
  createContext(null);


const COLOR_KEY =
  "academic-global-chart-color";

const GRADIENT_KEY =
  "academic-global-chart-gradient";


export const chartColorOptions = {
  red: {
    id: "red",
    name: "Rojas",
    description:
      "Gráficas en color rojo.",
    colors: [
      "#EF4444",
      "#EF4444",
      "#EF4444",
      "#EF4444",
      "#EF4444",
      "#EF4444",
    ],
  },

  blue: {
    id: "blue",
    name: "Azules",
    description:
      "Gráficas en color azul.",
    colors: [
      "#2563EB",
      "#2563EB",
      "#2563EB",
      "#2563EB",
      "#2563EB",
      "#2563EB",
    ],
  },

  aqua: {
    id: "aqua",
    name: "Verde aqua",
    description:
      "Gráficas en tono aqua.",
    colors: [
      "#06B6D4",
      "#06B6D4",
      "#06B6D4",
      "#06B6D4",
      "#06B6D4",
      "#06B6D4",
    ],
  },

  yellow: {
    id: "yellow",
    name: "Amarillas",
    description:
      "Gráficas en color amarillo.",
    colors: [
      "#EAB308",
      "#EAB308",
      "#EAB308",
      "#EAB308",
      "#EAB308",
      "#EAB308",
    ],
  },

  emerald: {
    id: "emerald",
    name: "Verde esmeralda",
    description:
      "Gráficas en verde esmeralda.",
    colors: [
      "#10B981",
      "#10B981",
      "#10B981",
      "#10B981",
      "#10B981",
      "#10B981",
    ],
  },

  lilac: {
    id: "lilac",
    name: "Lilas",
    description:
      "Gráficas en color lila.",
    colors: [
      "#8B5CF6",
      "#8B5CF6",
      "#8B5CF6",
      "#8B5CF6",
      "#8B5CF6",
      "#8B5CF6",
    ],
  },

  multicolor: {
    id: "multicolor",
    name: "Multicolor",
    description:
      "Cada barra o dato utiliza un color diferente.",
    colors: [
      "#2563EB",
      "#EF4444",
      "#10B981",
      "#EAB308",
      "#8B5CF6",
      "#06B6D4",
    ],
  },
};


export function ChartThemeProvider({
  children,
}) {
  const [
    chartColorId,
    setChartColorId,
  ] = useState(() => {
    const stored =
      localStorage.getItem(
        COLOR_KEY,
      );

    return chartColorOptions[
      stored
    ]
      ? stored
      : "aqua";
  });


  const [
    useGradient,
    setUseGradient,
  ] = useState(() => {
    return (
      localStorage.getItem(
        GRADIENT_KEY,
      ) !== "false"
    );
  });


  function changeChartColor(id) {
    if (
      !chartColorOptions[id]
    ) {
      return;
    }

    setChartColorId(id);

    localStorage.setItem(
      COLOR_KEY,
      id,
    );
  }


  function changeGradient(
    value,
  ) {
    setUseGradient(value);

    localStorage.setItem(
      GRADIENT_KEY,
      String(value),
    );
  }


  const palette =
    chartColorOptions[
      chartColorId
    ] ||
    chartColorOptions.aqua;


  const value =
    useMemo(
      () => ({
        chartColorId,

        // Se conservan estos nombres
        // para compatibilidad.
        paletteId:
          chartColorId,

        palette,

        useGradient,

        changeChartColor,

        changePalette:
          changeChartColor,

        changeGradient,
      }),
      [
        chartColorId,
        palette,
        useGradient,
      ],
    );


  return (
    <ChartThemeContext.Provider
      value={value}
    >
      {children}
    </ChartThemeContext.Provider>
  );
}


export function useChartTheme() {
  const context =
    useContext(
      ChartThemeContext,
    );

  if (!context) {
    throw new Error(
      "useChartTheme debe utilizarse dentro de ChartThemeProvider",
    );
  }

  return context;
}