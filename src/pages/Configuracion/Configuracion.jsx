import {
  BarChart3,
  Check,
  LayoutDashboard,
  MonitorCog,
  Moon,
  Palette,
  Sparkles,
  Sun,
} from "lucide-react";

import {
  themes,
} from "../../config/themes";

import {
  useTheme,
} from "../../context/ThemeContext";

import {
  chartColorOptions,
  useChartTheme,
} from "../../context/ChartThemeContext";

import {
  useDashboard,
} from "../../context/DashboardContext";

import "./Configuracion.css";


const themeIcons = {
  light: Sun,
  dark: Moon,
  ocean: MonitorCog,
  aurora: Sparkles,
};


const accents = [
  {
    id: "blue",
    name: "Azul",
    color: "#2563EB",
  },
  {
    id: "cyan",
    name: "Turquesa",
    color: "#06B6D4",
  },
  {
    id: "violet",
    name: "Violeta",
    color: "#8B5CF6",
  },
  {
    id: "emerald",
    name: "Esmeralda",
    color: "#10B981",
  },
  {
    id: "rose",
    name: "Rubí",
    color: "#E11D48",
  },
];


const chartTypes = [
  [
    "bar",
    "Barras",
  ],
  [
    "line",
    "Línea",
  ],
  [
    "area",
    "Área",
  ],
  [
    "pie",
    "Pastel",
  ],
];


function SettingSwitch({
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      className={
        checked
          ? "settings-switch settings-switch-active"
          : "settings-switch"
      }
      onClick={
        onChange
      }
    >
      <span />
    </button>
  );
}


function ChartPreview({
  type,
  colors,
}) {
  const safeColors =
    colors?.length
      ? colors
      : [
          "#06B6D4",
          "#06B6D4",
          "#06B6D4",
          "#06B6D4",
          "#06B6D4",
          "#06B6D4",
        ];


  const primary =
    safeColors[0];

  const secondary =
    safeColors[1] ||
    safeColors[0];


  if (type === "pie") {
    return (
      <div className="chart-preview chart-preview-pie-container">

        <div
          className="chart-preview-pie"
          style={{
            background: `
              conic-gradient(
                ${safeColors[0]} 0deg 60deg,
                ${safeColors[1]} 60deg 120deg,
                ${safeColors[2]} 120deg 180deg,
                ${safeColors[3]} 180deg 240deg,
                ${safeColors[4]} 240deg 300deg,
                ${safeColors[5]} 300deg 360deg
              )
            `,
          }}
        >
          <span />
        </div>

        <span className="chart-preview-label">
          Vista previa: gráfica de pastel
        </span>

      </div>
    );
  }


  if (type === "line") {
    return (
      <div className="chart-preview">

        <div className="chart-preview-grid" />

        <svg
          viewBox="0 0 320 120"
          preserveAspectRatio="none"
        >
          <polyline
            points="
              10,92
              60,75
              110,81
              160,48
              215,59
              265,31
              310,40
            "
            fill="none"
            stroke={
              primary
            }
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {[
            [10, 92],
            [60, 75],
            [110, 81],
            [160, 48],
            [215, 59],
            [265, 31],
            [310, 40],
          ].map(
            ([x, y]) => (
              <circle
                key={
                  `${x}-${y}`
                }
                cx={x}
                cy={y}
                r="5"
                fill={
                  primary
                }
              />
            ),
          )}
        </svg>

        <span className="chart-preview-label">
          Vista previa: gráfica de línea
        </span>

      </div>
    );
  }


  if (type === "area") {
    return (
      <div className="chart-preview">

        <div className="chart-preview-grid" />

        <svg
          viewBox="0 0 320 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="settings-area-preview"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={
                  primary
                }
                stopOpacity="0.8"
              />

              <stop
                offset="100%"
                stopColor={
                  secondary
                }
                stopOpacity="0.08"
              />
            </linearGradient>
          </defs>

          <path
            d="
              M 10 92
              L 60 77
              L 110 68
              L 160 58
              L 215 45
              L 265 37
              L 310 30
              L 310 110
              L 10 110 Z
            "
            fill="url(#settings-area-preview)"
          />

          <polyline
            points="
              10,92
              60,77
              110,68
              160,58
              215,45
              265,37
              310,30
            "
            fill="none"
            stroke={
              primary
            }
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        <span className="chart-preview-label">
          Vista previa: gráfica de área
        </span>

      </div>
    );
  }


  return (
    <div className="chart-preview">

      <div className="chart-preview-grid" />


      <div className="chart-preview-bars">

        {[
          52,
          82,
          65,
          94,
          72,
          88,
        ].map(
          (
            height,
            index,
          ) => (
            <span
              key={
                index
              }
              style={{
                height:
                  `${height}%`,

                background:
                  safeColors[
                    index %
                    safeColors.length
                  ],
              }}
            />
          ),
        )}

      </div>


      <span className="chart-preview-label">
        Vista previa: gráfica de barras
      </span>

    </div>
  );
}


function ChartTypeCard({
  title,
  chartKey,
  value,
  colors,
  setChartType,
}) {
  return (
    <article className="chart-type-card">

      <div className="chart-type-header">

        <div>
          <h3>
            {title}
          </h3>

          <p>
            Selecciona cómo quieres
            visualizar esta información.
          </p>
        </div>

      </div>


      <div className="chart-type-buttons">

        {chartTypes.map(
          (
            [
              id,
              label,
            ],
          ) => (
            <button
              type="button"
              key={
                id
              }
              className={
                value === id
                  ? "chart-type-button chart-type-button-active"
                  : "chart-type-button"
              }
              onClick={() =>
                setChartType(
                  chartKey,
                  id,
                )
              }
            >
              {label}
            </button>
          ),
        )}

      </div>


      <ChartPreview
        type={
          value
        }
        colors={
          colors
        }
      />

    </article>
  );
}


function Configuracion() {
  const {
    theme,
    accent,
    setTheme,
    setAccent,
  } = useTheme();


  const {
    chartColorId,
    palette,
    useGradient,
    changeChartColor,
    changeGradient,
  } = useChartTheme();


  const {
    settings,
    updateSettings,
    toggleCard,
    toggleChart,
    setChartType,
  } = useDashboard();


  return (
    <section className="settings-page">

      <header className="settings-header">

        <div>

          <p className="settings-eyebrow">
            PERSONALIZACIÓN
          </p>

          <h1>
            Configuración
          </h1>

          <p>
            Personaliza la apariencia,
            las gráficas y el contenido
            principal del sistema.
          </p>

        </div>


        <div className="settings-status">

          <Check
            size={17}
          />

          Preferencias guardadas
          automáticamente

        </div>

      </header>


      {/* APARIENCIA */}

      <section className="settings-section">

        <div className="settings-section-title">

          <Palette
            size={21}
          />

          <div>

            <h2>
              Apariencia
            </h2>

            <p>
              Elige la identidad visual
              completa del sistema.
            </p>

          </div>

        </div>


        <div className="theme-grid">

          {themes.map(
            (item) => {
              const Icon =
                themeIcons[
                  item.id
                ];

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  className={
                    theme === item.id
                      ? `theme-card theme-preview-${item.id} theme-card-selected`
                      : `theme-card theme-preview-${item.id}`
                  }
                  onClick={() =>
                    setTheme(
                      item.id,
                    )
                  }
                >

                  <div className="theme-preview">

                    <div className="theme-preview-sidebar" />

                    <div className="theme-preview-content">
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>


                  <div className="theme-card-info">

                    <div>

                      <Icon
                        size={18}
                      />

                      <strong>
                        {
                          item.name
                        }
                      </strong>

                    </div>


                    {theme ===
                      item.id && (
                      <Check
                        size={18}
                      />
                    )}

                  </div>


                  <p>
                    {
                      item.description
                    }
                  </p>

                </button>
              );
            },
          )}

        </div>


        <div className="settings-subsection">

          <h3>
            Color principal
          </h3>

          <p>
            Cambia botones, iconos,
            elementos seleccionados
            y detalles visuales.
          </p>


          <div className="accent-list">

            {accents.map(
              (item) => (
                <button
                  type="button"
                  key={
                    item.id
                  }
                  className={
                    accent === item.id
                      ? "accent-option accent-option-selected"
                      : "accent-option"
                  }
                  onClick={() =>
                    setAccent(
                      item.id,
                    )
                  }
                >

                  <span
                    style={{
                      background:
                        item.color,
                    }}
                  />

                  {
                    item.name
                  }


                  {accent ===
                    item.id && (
                    <Check
                      size={15}
                    />
                  )}

                </button>
              ),
            )}

          </div>

        </div>

      </section>


      {/* COLORES DE GRÁFICAS */}

      <section className="settings-section">

        <div className="settings-section-title">

          <BarChart3
            size={21}
          />

          <div>

            <h2>
              Escoge el color de las gráficas
            </h2>

            <p>
              Selecciona el color que quieres
              utilizar en las gráficas del
              Dashboard y Análisis.
            </p>

          </div>

        </div>


        <div className="chart-palette-grid">

          {Object.values(
            chartColorOptions,
          ).map(
            (item) => (
              <button
                type="button"
                key={
                  item.id
                }
                className={
                  chartColorId ===
                  item.id
                    ? "chart-palette-card chart-palette-selected"
                    : "chart-palette-card"
                }
                onClick={() =>
                  changeChartColor(
                    item.id,
                  )
                }
              >

                <div className="chart-color-preview">

                  {item.colors.map(
                    (
                      color,
                      index,
                    ) => (
                      <span
                        key={
                          index
                        }
                        style={{
                          background:
                            color,
                        }}
                      />
                    ),
                  )}

                </div>


                <div>

                  <strong>
                    {
                      item.name
                    }
                  </strong>


                  {chartColorId ===
                    item.id && (
                    <Check
                      size={16}
                    />
                  )}

                </div>


                <p
                  style={{
                    margin:
                      "7px 0 0",
                    textAlign:
                      "left",
                    fontSize:
                      "10px",
                    color:
                      "var(--text-muted)",
                  }}
                >
                  {
                    item.description
                  }
                </p>

              </button>
            ),
          )}

        </div>


        <div className="settings-subsection">

          <h3>
            Vista previa
          </h3>

          <p>
            Así se verán las barras con
            el color seleccionado.
          </p>


          <ChartPreview
            type="bar"
            colors={
              palette.colors
            }
          />

        </div>


        <div className="settings-row settings-row-large">

          <div>

            <strong>
              Degradados en gráficas
            </strong>

            <span>
              Usa transiciones de color
              en barras y áreas.
            </span>

          </div>


          <SettingSwitch
            checked={
              useGradient
            }
            onChange={() =>
              changeGradient(
                !useGradient,
              )
            }
          />

        </div>

      </section>


      {/* DASHBOARD */}

      <section className="settings-section">

        <div className="settings-section-title">

          <LayoutDashboard
            size={22}
          />

          <div>

            <h2>
              Dashboard
            </h2>

            <p>
              Decide qué información quieres
              ver en la página principal.
            </p>

          </div>

        </div>


        <div className="dashboard-settings-grid">

          <div className="settings-group">

            <h3>
              Tarjetas visibles
            </h3>


            {[
              [
                "alumnos",
                "Alumnos",
              ],
              [
                "aprobados",
                "Carreras",
              ],
              [
                "promedio",
                "Promedio general",
              ],
              [
                "riesgo",
                "En riesgo",
              ],
              [
                "materias",
                "Materias activas",
              ],
            ].map(
              (
                [
                  id,
                  label,
                ],
              ) => (
                <div
                  key={
                    id
                  }
                  className="settings-row dashboard-option-row"
                >

                  <span>
                    {
                      label
                    }
                  </span>


                  <SettingSwitch
                    checked={
                      settings
                        .cards?.[
                          id
                        ] ??
                      true
                    }
                    onChange={() =>
                      toggleCard(
                        id,
                      )
                    }
                  />

                </div>
              ),
            )}

          </div>


          <div className="settings-group">

            <h3>
              Gráficas visibles
            </h3>


            {[
              [
                "promedioMateria",
                "Promedio por semestre",
              ],
              [
                "evolucion",
                "Alumnos por semestre",
              ],
              [
                "aprobacion",
                "Riesgo por semestre",
              ],
            ].map(
              (
                [
                  id,
                  label,
                ],
              ) => (
                <div
                  key={
                    id
                  }
                  className="settings-row dashboard-option-row"
                >

                  <span>
                    {
                      label
                    }
                  </span>


                  <SettingSwitch
                    checked={
                      settings
                        .charts?.[
                          id
                        ] ??
                      true
                    }
                    onChange={() =>
                      toggleChart(
                        id,
                      )
                    }
                  />

                </div>
              ),
            )}

          </div>

        </div>


        <div className="dashboard-chart-config-grid">

          <ChartTypeCard
            title="Promedio por semestre"
            chartKey="promedioMateria"
            value={
              settings
                .chartTypes
                ?.promedioMateria ||
              "bar"
            }
            colors={
              palette.colors
            }
            setChartType={
              setChartType
            }
          />


          <ChartTypeCard
            title="Alumnos por semestre"
            chartKey="evolucion"
            value={
              settings
                .chartTypes
                ?.evolucion ||
              "bar"
            }
            colors={
              palette.colors
            }
            setChartType={
              setChartType
            }
          />


          <ChartTypeCard
            title="Riesgo por semestre"
            chartKey="aprobacion"
            value={
              settings
                .chartTypes
                ?.aprobacion ||
              "bar"
            }
            colors={
              palette.colors
            }
            setChartType={
              setChartType
            }
          />

        </div>


        <div className="settings-subsection">

          <h3>
            Tamaño del Dashboard
          </h3>

          <p>
            Ajusta la cantidad de espacio
            utilizado por tarjetas y gráficas.
          </p>


          <div className="density-options">

            {[
              [
                "compact",
                "Compacto",
              ],
              [
                "normal",
                "Normal",
              ],
              [
                "large",
                "Amplio",
              ],
            ].map(
              (
                [
                  id,
                  label,
                ],
              ) => (
                <button
                  type="button"
                  key={
                    id
                  }
                  className={
                    settings
                      .density ===
                    id
                      ? "density-button density-button-selected"
                      : "density-button"
                  }
                  onClick={() =>
                    updateSettings({
                      ...settings,
                      density:
                        id,
                    })
                  }
                >
                  {
                    label
                  }
                </button>
              ),
            )}

          </div>

        </div>

      </section>

    </section>
  );
}


export default Configuracion;