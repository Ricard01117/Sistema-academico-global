import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  RefreshCw,
  School,
  Users,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getDashboard,
} from "../../services/dashboardService";

import {
  useChartTheme,
} from "../../context/ChartThemeContext";

import {
  useDashboard,
} from "../../context/DashboardContext";

import "./Dashboard.css";


const emptyDashboard = {
  catalogos: {
    carreras: [],
  },

  resumen: {
    alumnos: 0,
    carreras: 0,
    materias: 0,
    promedio_general: null,
    evaluados: 0,
    sin_evaluacion: 0,
    en_riesgo: 0,
    criticos: 0,
    atencion: 0,
    en_regla: 0,
  },

  promedio_por_carrera: [],
  promedio_por_semestre: [],
  alumnos_por_semestre: [],
  riesgo_por_semestre: [],
};


function AcademicChart({
  type,
  data,
  dataKey,
  nameKey,
  colors,
  useGradient,
  maximum = null,
  chartId,
}) {
  const primary =
    colors?.[0] ||
    "#06B6D4";


  if (type === "pie") {
    return (
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>

          <Tooltip />

          <Pie
            data={
              data
            }
            dataKey={
              dataKey
            }
            nameKey={
              nameKey
            }
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="78%"
            paddingAngle={1}
            label={
              data.length <= 12
                ? ({
                    name,
                  }) => name
                : false
            }
          >
            {data.map(
              (
                item,
                index,
              ) => (
                <Cell
                  key={
                    `${chartId}-${index}`
                  }
                  fill={
                    colors[
                      index %
                      colors.length
                    ]
                  }
                />
              ),
            )}
          </Pie>

        </PieChart>
      </ResponsiveContainer>
    );
  }


  if (type === "line") {
    return (
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={
            data
          }
        >

          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.13}
          />

          <XAxis
            dataKey={
              nameKey
            }
            tick={{
              fontSize: 10,
            }}
          />

          <YAxis
            domain={
              maximum
                ? [
                    0,
                    maximum,
                  ]
                : undefined
            }
            allowDecimals={
              maximum === null
            }
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey={
              dataKey
            }
            stroke={
              primary
            }
            strokeWidth={3}
            dot={{
              fill:
                primary,

              r: 3,
            }}
            activeDot={{
              r: 6,
            }}
          />

        </LineChart>
      </ResponsiveContainer>
    );
  }


  if (type === "area") {
    return (
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={
            data
          }
        >

          <defs>
            <linearGradient
              id={`gradient-${chartId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="0%"
                stopColor={
                  colors[0]
                }
                stopOpacity={
                  useGradient
                    ? 0.8
                    : 0.35
                }
              />

              <stop
                offset="100%"
                stopColor={
                  colors[1] ||
                  colors[0]
                }
                stopOpacity={
                  useGradient
                    ? 0.08
                    : 0.2
                }
              />

            </linearGradient>
          </defs>


          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.13}
          />

          <XAxis
            dataKey={
              nameKey
            }
            tick={{
              fontSize: 10,
            }}
          />

          <YAxis
            domain={
              maximum
                ? [
                    0,
                    maximum,
                  ]
                : undefined
            }
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey={
              dataKey
            }
            stroke={
              colors[0]
            }
            strokeWidth={3}
            fill={
              `url(#gradient-${chartId})`
            }
          />

        </AreaChart>
      </ResponsiveContainer>
    );
  }


  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <BarChart
        data={
          data
        }
      >

        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.13}
        />

        <XAxis
          dataKey={
            nameKey
          }
          tick={{
            fontSize: 10,
          }}
        />

        <YAxis
          domain={
            maximum
              ? [
                  0,
                  maximum,
                ]
              : undefined
          }
          allowDecimals={
            maximum === null
              ? false
              : true
          }
        />

        <Tooltip />


        <Bar
          dataKey={
            dataKey
          }
          radius={[
            6,
            6,
            0,
            0,
          ]}
        >

          {data.map(
            (
              item,
              index,
            ) => (
              <Cell
                key={
                  `${chartId}-${index}`
                }
                fill={
                  colors[
                    index %
                    colors.length
                  ]
                }
              />
            ),
          )}

        </Bar>

      </BarChart>
    </ResponsiveContainer>
  );
}


function Dashboard() {
  const {
    palette,
    useGradient,
  } = useChartTheme();


  const {
    settings,
  } = useDashboard();


  const [
    dashboard,
    setDashboard,
  ] = useState(
    emptyDashboard,
  );


  const [
    carreraId,
    setCarreraId,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getDashboard(
          carreraId,
        );

      setDashboard(
        data,
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadDashboard();
  }, [
    carreraId,
  ]);


  const resumen =
    dashboard.resumen;


  const promedioSemestres =
    dashboard
      .promedio_por_semestre
      .map(
        (item) => ({
          ...item,

          etiqueta:
            carreraId
              ? `Sem ${item.semestre}`
              : item.nombre,

          promedio:
            item.promedio ?? 0,
        }),
      );


  const alumnosSemestres =
    dashboard
      .alumnos_por_semestre
      .map(
        (item) => ({
          ...item,

          etiqueta:
            carreraId
              ? item.nombre.replace(
                  /^.* S/,
                  "Sem ",
                )
              : item.nombre,
        }),
      );


  const riesgoSemestres =
    dashboard
      .riesgo_por_semestre
      .map(
        (item) => ({
          ...item,

          etiqueta:
            carreraId
              ? item.nombre.replace(
                  /^.* S/,
                  "Sem ",
                )
              : item.nombre,
        }),
      );


  const showCard =
    (id) =>
      settings
        .cards?.[id] ??
      true;


  const showChart =
    (id) =>
      settings
        .charts?.[id] ??
      true;


  const promedioType =
    settings
      .chartTypes
      ?.promedioMateria ||
    "bar";


  const alumnosType =
    settings
      .chartTypes
      ?.evolucion ||
    "bar";


  const riesgoType =
    settings
      .chartTypes
      ?.aprobacion ||
    "bar";


  return (
    <section
      className={
        `dashboard-page dashboard-density-${settings.density || "normal"}`
      }
    >

      <header className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">
            VISTA GENERAL
          </p>

          <h1>
            Dashboard
          </h1>

          <p>
            Resumen general del rendimiento
            académico por carrera y semestre.
          </p>

        </div>


        <div className="dashboard-header-actions">

          <select
            value={
              carreraId
            }
            onChange={
              (event) =>
                setCarreraId(
                  event
                    .target
                    .value,
                )
            }
          >

            <option value="">
              Todas las carreras
            </option>

            {dashboard
              .catalogos
              .carreras
              .map(
                (carrera) => (
                  <option
                    key={
                      carrera.id
                    }
                    value={
                      carrera.id
                    }
                  >
                    {
                      carrera.clave
                    }
                    {" - "}
                    {
                      carrera.nombre
                    }
                  </option>
                ),
              )}

          </select>


          <button
            type="button"
            onClick={
              loadDashboard
            }
          >

            <RefreshCw
              size={16}
            />

            Actualizar datos

          </button>

        </div>

      </header>


      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      <section className="dashboard-stats">

        {showCard(
          "alumnos",
        ) && (
          <StatCard
            icon={
              <Users />
            }
            title="Alumnos"
            value={
              resumen.alumnos
            }
            text="Alumnos activos"
          />
        )}


        {showCard(
          "aprobados",
        ) && (
          <StatCard
            icon={
              <School />
            }
            title="Carreras"
            value={
              resumen.carreras
            }
            text="Carreras activas"
          />
        )}


        {showCard(
          "promedio",
        ) && (
          <StatCard
            icon={
              <GraduationCap />
            }
            title="Promedio general"
            value={
              resumen
                .promedio_general ??
              "—"
            }
            text={
              `${resumen.evaluados} alumnos evaluados`
            }
          />
        )}


        {showCard(
          "riesgo",
        ) && (
          <StatCard
            icon={
              <AlertTriangle />
            }
            title="En riesgo"
            value={
              resumen.en_riesgo
            }
            text={
              `${resumen.criticos} críticos · ${resumen.atencion} atención`
            }
            risk
          />
        )}

      </section>


      {loading ? (
        <div className="dashboard-loading">
          Calculando información...
        </div>
      ) : (
        <section className="dashboard-chart-grid">

          {showChart(
            "promedioMateria",
          ) && (
            <article className="dashboard-chart-card">

              <div className="dashboard-chart-title">

                <div>
                  <h2>
                    Promedio por semestre
                  </h2>

                  <p>
                    Promedio académico
                    de los alumnos
                    evaluados en cada
                    semestre.
                  </p>
                </div>

                <GraduationCap
                  size={20}
                />

              </div>


              <div className="dashboard-chart">

                <AcademicChart
                  type={
                    promedioType
                  }
                  data={
                    promedioSemestres
                  }
                  dataKey="promedio"
                  nameKey="etiqueta"
                  colors={
                    palette.colors
                  }
                  useGradient={
                    useGradient
                  }
                  maximum={10}
                  chartId="promedio-semestre"
                />

              </div>

            </article>
          )}


          {showChart(
            "evolucion",
          ) && (
            <article className="dashboard-chart-card">

              <div className="dashboard-chart-title">

                <div>
                  <h2>
                    Alumnos por semestre
                  </h2>

                  <p>
                    Cantidad de alumnos
                    activos registrados
                    en cada semestre.
                  </p>
                </div>

                <Users
                  size={20}
                />

              </div>


              <div className="dashboard-chart">

                <AcademicChart
                  type={
                    alumnosType
                  }
                  data={
                    alumnosSemestres
                  }
                  dataKey="cantidad"
                  nameKey="etiqueta"
                  colors={
                    palette.colors
                  }
                  useGradient={
                    useGradient
                  }
                  chartId="alumnos-semestre"
                />

              </div>

            </article>
          )}


          {showChart(
            "aprobacion",
          ) && (
            <article className="dashboard-chart-card">

              <div className="dashboard-chart-title">

                <div>
                  <h2>
                    Riesgo por semestre
                  </h2>

                  <p>
                    Alumnos cuyo promedio
                    académico actual es
                    menor a 7.00.
                  </p>
                </div>

                <AlertTriangle
                  size={20}
                />

              </div>


              <div className="dashboard-chart">

                <AcademicChart
                  type={
                    riesgoType
                  }
                  data={
                    riesgoSemestres
                  }
                  dataKey="en_riesgo"
                  nameKey="etiqueta"
                  colors={
                    palette.colors
                  }
                  useGradient={
                    useGradient
                  }
                  chartId="riesgo-semestre"
                />

              </div>

            </article>
          )}


          {showCard(
            "materias",
          ) && (
            <article className="dashboard-chart-card">

              <div className="dashboard-chart-title">

                <div>
                  <h2>
                    Materias activas
                  </h2>

                  <p>
                    Materias asociadas
                    a la carrera
                    seleccionada.
                  </p>
                </div>

                <BookOpen
                  size={20}
                />

              </div>


              <div className="dashboard-big-number">

                <strong>
                  {
                    resumen.materias
                  }
                </strong>

                <span>
                  materias activas
                </span>

                <div>
                  {
                    resumen
                      .sin_evaluacion
                  }
                  {
                    " alumno(s) todavía sin evaluación"
                  }
                </div>

              </div>

            </article>
          )}

        </section>
      )}

    </section>
  );
}


function StatCard({
  icon,
  title,
  value,
  text,
  risk = false,
}) {
  return (
    <article
      className={
        risk
          ? "dashboard-stat-card dashboard-stat-risk"
          : "dashboard-stat-card"
      }
    >

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {text}
        </small>

      </div>


      <div className="dashboard-stat-icon">
        {icon}
      </div>

    </article>
  );
}


export default Dashboard;