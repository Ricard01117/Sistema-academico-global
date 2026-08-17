import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Users,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAnalisis,
  getAnalisisCatalogos,
} from "../../services/analisisService";

import {
  useChartTheme,
} from "../../context/ChartThemeContext";

import {
  SEMESTRES,
} from "../../utils/academicUtils";

import "./Analisis.css";


const emptyData = {
  resumen: {
    total_alumnos: 0,
    evaluados: 0,
    sin_evaluacion: 0,
    en_regla: 0,
    en_riesgo: 0,
    criticos: 0,
    atencion: 0,
    promedio_general: null,
    porcentaje_en_regla: 0,
    porcentaje_riesgo: 0,
  },

  promedio_por_semestre: [],
  promedio_por_carrera: [],
  alumnos_por_semestre: [],
  riesgo_por_semestre: [],
  ranking_materias: [],
  distribucion: [],
  insights: [],
};


function Analisis() {
  const {
    palette,
  } = useChartTheme();

  const [
    catalogos,
    setCatalogos,
  ] = useState({
    carreras: [],
    semestres: [],
  });

  const [
    filters,
    setFilters,
  ] = useState({
    carrera_id: "",
    semestre: "",
  });

  const [
    data,
    setData,
  ] = useState(
    emptyData,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  async function loadCatalogos() {
    try {
      const result =
        await getAnalisisCatalogos();

      setCatalogos(
        result,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  async function loadAnalisis() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getAnalisis(
          filters,
        );

      setData(
        result,
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
    loadCatalogos();
  }, []);


  useEffect(() => {
    loadAnalisis();
  }, [
    filters.carrera_id,
    filters.semestre,
  ]);


  function changeCarrera(
    value,
  ) {
    setFilters({
      carrera_id:
        value,

      semestre:
        "",
    });
  }


  const resumen =
    data.resumen;


  return (
    <section className="analysis-page">

      <header className="analysis-header">

        <div>
          <p className="analysis-eyebrow">
            INTELIGENCIA ACADÉMICA
          </p>

          <h1>
            Análisis académico
          </h1>

          <p>
            Analiza el rendimiento real
            por carrera y semestre.
          </p>
        </div>

      </header>


      <section className="analysis-filters">

        <select
          value={
            filters.carrera_id
          }
          onChange={
            (event) =>
              changeCarrera(
                event.target.value,
              )
          }
        >
          <option value="">
            Todas las carreras
          </option>

          {catalogos.carreras.map(
            (carrera) => (
              <option
                key={
                  carrera.id
                }
                value={
                  carrera.id
                }
              >
                {carrera.clave}
                {" - "}
                {carrera.nombre}
              </option>
            ),
          )}
        </select>


        <select
          value={
            filters.semestre
          }
          onChange={
            (event) =>
              setFilters(
                (current) => ({
                  ...current,

                  semestre:
                    event.target.value,
                }),
              )
          }
          disabled={
            !filters.carrera_id
          }
        >
          <option value="">
            Todos los semestres
          </option>

          {SEMESTRES.map(
            (numero) => (
              <option
                key={
                  numero
                }
                value={
                  numero
                }
              >
                Semestre {numero}
              </option>
            ),
          )}
        </select>

      </section>


      {error && (
        <div className="analysis-error">
          {error}
        </div>
      )}


      <section className="analysis-stats">

        <Stat
          icon={
            <GraduationCap />
          }
          title="Promedio actual"
          value={
            resumen
              .promedio_general ??
            "—"
          }
        />


        <Stat
          icon={
            <CheckCircle2 />
          }
          title="Promedio ≥ 7"
          value={
            `${resumen.porcentaje_en_regla}%`
          }
        />


        <Stat
          icon={
            <AlertTriangle />
          }
          title="Promedio < 7"
          value={
            `${resumen.porcentaje_riesgo}%`
          }
          risk
        />


        <Stat
          icon={
            <Users />
          }
          title="Alumnos evaluados"
          value={
            resumen.evaluados
          }
        />

      </section>


      {loading ? (
        <div className="analysis-loading">
          Analizando información...
        </div>
      ) : (
        <>

          <section className="analysis-chart-grid">

            <ChartCard
              title="Promedio por materia"
              description="Promedio obtenido por los alumnos evaluados en cada materia."
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    data
                      .ranking_materias
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.13}
                  />

                  <XAxis
                    dataKey="materia"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[
                      0,
                      10,
                    ]}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="promedio"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  >
                    {data
                      .ranking_materias
                      .map(
                        (
                          item,
                          index,
                        ) => (
                          <Cell
                            key={
                              item.materia_id
                            }
                            fill={
                              palette
                                .colors[
                                  index %
                                  palette
                                    .colors
                                    .length
                                ]
                            }
                          />
                        ),
                      )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>


            <ChartCard
              title="Promedio por semestre"
              description="Promedio del grupo calculado a partir del promedio individual de cada alumno."
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    data
                      .promedio_por_semestre
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.13}
                  />

                  <XAxis
                    dataKey="nombre"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[
                      0,
                      10,
                    ]}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="promedio"
                    fill={
                      palette.colors[0]
                    }
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>


            <ChartCard
              title="Alumnos por semestre"
              description="Número total de alumnos activos registrados."
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    data
                      .alumnos_por_semestre
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.13}
                  />

                  <XAxis
                    dataKey="nombre"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="cantidad"
                    fill={
                      palette.colors[1] ||
                      palette.colors[0]
                    }
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>


            <ChartCard
              title="Riesgo por semestre"
              description="Cantidad de alumnos con promedio actual menor a 7.00."
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    data
                      .riesgo_por_semestre
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.13}
                  />

                  <XAxis
                    dataKey="nombre"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="en_riesgo"
                    fill={
                      palette.colors[2] ||
                      palette.colors[0]
                    }
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </section>


          <section className="analysis-insights">

            <div className="analysis-section-title">

              <Lightbulb />

              <div>
                <h2>
                  Hallazgos académicos
                </h2>

                <p>
                  Observaciones calculadas
                  automáticamente con los
                  datos registrados.
                </p>
              </div>

            </div>


            <div className="analysis-insight-list">

              {data.insights.map(
                (
                  insight,
                  index,
                ) => (
                  <article
                    key={
                      index
                    }
                    className="analysis-insight"
                  >
                    <span>
                      {index + 1}
                    </span>

                    <p>
                      {insight}
                    </p>
                  </article>
                ),
              )}

            </div>

          </section>


          <section className="analysis-ranking">

            <div className="analysis-section-title">

              <BarChart3 />

              <div>
                <h2>
                  Rendimiento por materia
                </h2>

                <p>
                  Promedio real de cada
                  materia registrada.
                </p>
              </div>

            </div>


            <div className="analysis-table-wrapper">

              <table className="analysis-table">

                <thead>
                  <tr>
                    <th>
                      Materia
                    </th>

                    <th>
                      Carrera
                    </th>

                    <th>
                      Semestre
                    </th>

                    <th>
                      Promedio
                    </th>

                    <th>
                      Evaluados
                    </th>
                  </tr>
                </thead>


                <tbody>

                  {data
                    .ranking_materias
                    .length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="analysis-empty"
                      >
                        Todavía no hay
                        calificaciones.
                      </td>
                    </tr>
                  ) : (
                    data
                      .ranking_materias
                      .map(
                        (item) => (
                          <tr
                            key={
                              item
                                .materia_id
                            }
                          >

                            <td>
                              <strong>
                                {
                                  item
                                    .materia
                                }
                              </strong>

                              <span className="analysis-subject-code">
                                {
                                  item
                                    .clave
                                }
                              </span>
                            </td>

                            <td>
                              {
                                item
                                  .carrera_clave
                              }
                            </td>

                            <td>
                              Semestre {
                                item.semestre
                              }
                            </td>

                            <td>
                              <strong
                                className={
                                  item.promedio ===
                                  null
                                    ? "analysis-score analysis-score-empty"
                                    :
                                  item.promedio <
                                  6.6
                                    ? "analysis-score analysis-score-danger"
                                    :
                                  item.promedio <
                                  7
                                    ? "analysis-score analysis-score-warning"
                                    : "analysis-score"
                                }
                              >
                                {
                                  item.promedio ??
                                  "—"
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                item
                                  .evaluados
                              }
                            </td>

                          </tr>
                        ),
                      )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </>
      )}

    </section>
  );
}


function Stat({
  icon,
  title,
  value,
  risk = false,
}) {
  return (
    <article
      className={
        risk
          ? "analysis-stat analysis-stat-risk"
          : "analysis-stat"
      }
    >

      <div className="analysis-stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </article>
  );
}


function ChartCard({
  title,
  description,
  children,
}) {
  return (
    <article className="analysis-card">

      <h2>
        {title}
      </h2>

      <p>
        {description}
      </p>

      <div className="analysis-chart">
        {children}
      </div>

    </article>
  );
}


export default Analisis;