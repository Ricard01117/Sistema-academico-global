import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";


const DashboardContext =
  createContext(null);


const STORAGE_KEY =
  "academic-global-dashboard";


const defaultSettings = {
  density: "normal",

  cards: {
    alumnos: true,
    aprobados: true,
    riesgo: true,
    materias: true,
    grupos: false,
    promedio: false,
  },

  charts: {
    promedioMateria: true,
    evolucion: true,
    aprobacion: false,
    semestres: false,
  },

  chartTypes: {
    promedioMateria: "bar",
    evolucion: "area",
    aprobacion: "donut",
    semestres: "bar",
  },

  showGrid: true,
  showTooltip: true,
  animations: true,
};


function loadSettings() {
  const saved =
    localStorage.getItem(
      STORAGE_KEY,
    );

  if (!saved) {
    return defaultSettings;
  }

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(saved),
    };
  } catch {
    return defaultSettings;
  }
}


export function DashboardProvider({
  children,
}) {
  const [settings, setSettings] =
    useState(loadSettings);


  function updateSettings(next) {
    setSettings((current) => {
      const updated =
        typeof next === "function"
          ? next(current)
          : {
              ...current,
              ...next,
            };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      );

      return updated;
    });
  }


  function toggleCard(card) {
    updateSettings((current) => ({
      ...current,

      cards: {
        ...current.cards,

        [card]:
          !current.cards[card],
      },
    }));
  }


  function toggleChart(chart) {
    updateSettings((current) => ({
      ...current,

      charts: {
        ...current.charts,

        [chart]:
          !current.charts[chart],
      },
    }));
  }


  function setChartType(
    chart,
    type,
  ) {
    updateSettings((current) => ({
      ...current,

      chartTypes: {
        ...current.chartTypes,

        [chart]: type,
      },
    }));
  }


  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      toggleCard,
      toggleChart,
      setChartType,
    }),
    [settings],
  );


  return (
    <DashboardContext.Provider
      value={value}
    >
      {children}
    </DashboardContext.Provider>
  );
}


export function useDashboard() {
  const context =
    useContext(DashboardContext);

  if (!context) {
    throw new Error(
      "useDashboard debe utilizarse dentro de DashboardProvider",
    );
  }

  return context;
}