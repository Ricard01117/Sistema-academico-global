import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Save,
  UsersRound,
} from "lucide-react";

import {
  getCalificacionesCatalogos,
  getMatrizCalificaciones,
  guardarMatrizCalificaciones,
} from "../../services/calificacionesService";

import {
  formatearNombreTabla,
  SEMESTRES,
} from "../../utils/academicUtils";

import "./Calificaciones.css";


function calcularPromedio(
  alumno,
  valoresLocales,
  materias,
) {
  const valores = [];

  materias.forEach(
    (materia) => {
      const key =
        `${alumno.inscripcion_id}-${materia.id}`;

      let valor;

      if (
        Object.prototype.hasOwnProperty.call(
          valoresLocales,
          key,
        )
      ) {
        valor =
          valoresLocales[
            key
          ];
      } else {
        valor =
          alumno
            .calificaciones?.[
              String(
                materia.id
              )
            ]?.valor;
      }

      if (
        valor !== "" &&
        valor !== null &&
        valor !== undefined &&
        !Number.isNaN(
          Number(valor)
        )
      ) {
        valores.push(
          Number(valor),
        );
      }
    },
  );

  if (
    valores.length === 0
  ) {
    return null;
  }

  return Number(
    (
      valores.reduce(
        (total, valor) =>
          total + valor,
        0,
      ) /
      valores.length
    ).toFixed(2),
  );
}


function obtenerNivelPromedio(
  promedio,
) {
  if (
    promedio === null ||
    promedio === undefined
  ) {
    return "pending";
  }

  if (promedio < 6.6) {
    return "danger";
  }

  if (promedio < 7) {
    return "warning";
  }

  return "normal";
}


function Calificaciones() {
  const [
    carreras,
    setCarreras,
  ] = useState([]);

  const [
    carrera,
    setCarrera,
  ] = useState(null);

  const [
    semestre,
    setSemestre,
  ] = useState(null);

  const [
    matriz,
    setMatriz,
  ] = useState(null);

  const [
    valores,
    setValores,
  ] = useState({});

  const [
    cambios,
    setCambios,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");


  async function loadCatalogos() {
    try {
      setLoading(true);

      const data =
        await getCalificacionesCatalogos();

      setCarreras(
        data.carreras || [],
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


  async function seleccionarSemestre(
    numero,
  ) {
    try {
      setSemestre(
        numero,
      );

      setLoading(true);
      setError("");
      setMessage("");

      const data =
        await getMatrizCalificaciones(
          carrera.id,
          numero,
        );

      setMatriz(
        data,
      );

      setValores({});
      setCambios({});
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }


  function volver() {
    if (semestre) {
      setSemestre(null);
      setMatriz(null);
      setValores({});
      setCambios({});
      return;
    }

    setCarrera(null);
  }


  function changeGrade(
    alumno,
    materia,
    value,
  ) {
    if (
      value !== "" &&
      (
        Number(value) < 0 ||
        Number(value) > 10
      )
    ) {
      return;
    }

    const key =
      `${alumno.inscripcion_id}-${materia.id}`;

    const registro =
      alumno
        .calificaciones?.[
          String(
            materia.id
          )
        ];

    if (!registro) {
      return;
    }

    setValores(
      (current) => ({
        ...current,

        [key]:
          value,
      }),
    );

    setCambios(
      (current) => ({
        ...current,

        [registro.calificacion_id]:
          value === ""
            ? null
            : Number(value),
      }),
    );
  }


  function getGradeValue(
    alumno,
    materia,
  ) {
    const key =
      `${alumno.inscripcion_id}-${materia.id}`;

    if (
      Object.prototype.hasOwnProperty.call(
        valores,
        key,
      )
    ) {
      return valores[key];
    }

    return (
      alumno
        .calificaciones?.[
          String(
            materia.id
          )
        ]?.valor ?? ""
    );
  }


  async function guardar() {
    const entries =
      Object.entries(
        cambios,
      );

    if (
      entries.length === 0
    ) {
      setMessage(
        "No hay cambios pendientes.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload =
        entries.map(
          ([
            calificacionId,
            calificacion,
          ]) => ({
            calificacion_id:
              Number(
                calificacionId
              ),

            calificacion,
          }),
        );

      await guardarMatrizCalificaciones(
        payload,
      );

      const data =
        await getMatrizCalificaciones(
          carrera.id,
          semestre,
        );

      setMatriz(
        data,
      );

      setValores({});
      setCambios({});

      setMessage(
        "Calificaciones guardadas correctamente.",
      );

      window.dispatchEvent(
        new Event(
          "academic-risk-updated",
        ),
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setSaving(false);
    }
  }


  const resumen =
    useMemo(
      () => {
        if (!matriz) {
          return {
            alumnos: 0,
            evaluados: 0,
            riesgo: 0,
            criticos: 0,
            promedio: null,
          };
        }

        const promedios =
          matriz.alumnos
            .map(
              (alumno) =>
                calcularPromedio(
                  alumno,
                  valores,
                  matriz.materias,
                ),
            )
            .filter(
              (promedio) =>
                promedio !== null,
            );

        const riesgo =
          promedios.filter(
            (promedio) =>
              promedio < 7,
          ).length;

        const criticos =
          promedios.filter(
            (promedio) =>
              promedio < 6.6,
          ).length;

        const promedio =
          promedios.length
            ? Number(
                (
                  promedios.reduce(
                    (
                      total,
                      valor,
                    ) =>
                      total +
                      valor,
                    0,
                  ) /
                  promedios.length
                ).toFixed(2),
              )
            : null;

        return {
          alumnos:
            matriz.alumnos.length,

          evaluados:
            promedios.length,

          riesgo,

          criticos,

          promedio,
        };
      },
      [
        matriz,
        valores,
      ],
    );


  return (
    <section className="grades-page">

      <header className="grades-header">

        <div>
          <p className="grades-eyebrow">
            CONTROL DE CALIFICACIONES
          </p>

          <h1>
            Calificaciones
          </h1>

          <p>
            Selecciona carrera y semestre.
            Las materias aparecen
            automáticamente como columnas.
          </p>
        </div>

        {matriz && (
          <button
            type="button"
            className="grades-save-button"
            onClick={
              guardar
            }
            disabled={
              saving
            }
          >
            <Save size={18} />

            {saving
              ? "Guardando..."
              : "Guardar calificaciones"}
          </button>
        )}

      </header>


      {error && (
        <div className="grades-error">
          {error}
        </div>
      )}


      {message && (
        <div className="grades-success">
          {message}
        </div>
      )}


      {carrera && (
        <button
          type="button"
          className="grades-back-button"
          onClick={
            volver
          }
        >
          <ArrowLeft
            size={17}
          />

          {semestre
            ? "Volver a semestres"
            : "Volver a carreras"}
        </button>
      )}


      {!carrera && (
        <div className="grades-career-grid">

          {carreras.map(
            (item) => (
              <button
                key={
                  item.id
                }
                type="button"
                className="grades-career-card"
                onClick={() =>
                  setCarrera(
                    item,
                  )
                }
              >

                <div className="grades-card-icon">
                  <GraduationCap
                    size={27}
                  />
                </div>

                <div>
                  <strong>
                    {item.clave}
                  </strong>

                  <span>
                    {item.nombre}
                  </span>
                </div>

                <ChevronRight
                  size={20}
                />

              </button>
            ),
          )}

        </div>
      )}


      {carrera &&
        !semestre && (
          <>
            <div className="grades-selected-title">
              <span>
                Carrera
              </span>

              <h2>
                {carrera.nombre}
              </h2>
            </div>


            <div className="grades-semester-grid">

              {SEMESTRES.map(
                (numero) => (
                  <button
                    key={
                      numero
                    }
                    type="button"
                    className="grades-semester-card"
                    onClick={() =>
                      seleccionarSemestre(
                        numero,
                      )
                    }
                  >

                    <div className="grades-semester-number">
                      {numero}
                    </div>

                    <div>
                      <strong>
                        Semestre {numero}
                      </strong>

                      <span>
                        Ver calificaciones
                      </span>
                    </div>

                    <ChevronRight
                      size={18}
                    />

                  </button>
                ),
              )}

            </div>
          </>
        )}


      {carrera &&
        semestre &&
        matriz && (
          <>

            <section className="grades-summary">

              <article>
                <UsersRound
                  size={20}
                />

                <div>
                  <span>
                    Alumnos
                  </span>

                  <strong>
                    {
                      resumen.alumnos
                    }
                  </strong>
                </div>
              </article>


              <article>
                <BookOpen
                  size={20}
                />

                <div>
                  <span>
                    Materias
                  </span>

                  <strong>
                    {
                      matriz
                        .materias
                        .length
                    }
                  </strong>
                </div>
              </article>


              <article>
                <GraduationCap
                  size={20}
                />

                <div>
                  <span>
                    Promedio del semestre
                  </span>

                  <strong>
                    {
                      resumen.promedio ??
                      "—"
                    }
                  </strong>
                </div>
              </article>


              <article
                className="grades-risk-stat"
              >
                <AlertTriangle
                  size={20}
                />

                <div>
                  <span>
                    En riesgo
                  </span>

                  <strong>
                    {
                      resumen.riesgo
                    }
                  </strong>
                </div>
              </article>

            </section>


            <section className="grades-panel">

              <div className="grades-table-title">

                <div>
                  <span>
                    {carrera.clave}
                  </span>

                  <h2>
                    Semestre {semestre}
                  </h2>
                </div>

                <div className="grades-table-legend">
                  <span className="grades-legend-danger">
                    Rojo: menor a 6.60
                  </span>

                  <span className="grades-legend-warning">
                    Amarillo: 6.60 a 6.99
                  </span>

                  <span className="grades-legend-normal">
                    Normal: 7.00 o más
                  </span>
                </div>

              </div>


              <div className="grades-matrix-wrapper">

                <table className="grades-matrix">

                  <thead>
                    <tr>

                      <th className="grades-name-column">
                        Alumno
                      </th>

                      {matriz.materias.map(
                        (materia) => (
                          <th
                            key={
                              materia.id
                            }
                            className="grades-subject-column"
                          >
                            <strong>
                              {
                                materia.nombre
                              }
                            </strong>

                            <span>
                              {
                                materia.clave
                              }
                            </span>
                          </th>
                        ),
                      )}

                      <th>
                        Promedio
                      </th>

                      <th>
                        Estado
                      </th>

                    </tr>
                  </thead>


                  <tbody>

                    {loading ? (
                      <tr>
                        <td
                          colSpan={
                            matriz
                              .materias
                              .length +
                            3
                          }
                          className="grades-empty"
                        >
                          Cargando...
                        </td>
                      </tr>
                    ) :
                    matriz.alumnos.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={
                            matriz
                              .materias
                              .length +
                            3
                          }
                          className="grades-empty"
                        >
                          No hay alumnos
                          registrados en este
                          semestre.
                        </td>
                      </tr>
                    ) : (
                      matriz.alumnos.map(
                        (alumno) => {
                          const promedio =
                            calcularPromedio(
                              alumno,
                              valores,
                              matriz.materias,
                            );

                          const nivel =
                            obtenerNivelPromedio(
                              promedio,
                            );

                          let rowClass = "";

                          if (
                            nivel ===
                            "danger"
                          ) {
                            rowClass =
                              "grades-danger-row";
                          }

                          if (
                            nivel ===
                            "warning"
                          ) {
                            rowClass =
                              "grades-warning-row";
                          }

                          return (
                            <tr
                              key={
                                alumno
                                  .inscripcion_id
                              }
                              className={
                                rowClass
                              }
                            >

                              <td className="grades-name-column">
                                <div className="grades-student-name">

                                  <strong>
                                    {
                                      formatearNombreTabla(
                                        alumno.nombre,
                                      )
                                    }
                                  </strong>

                                  <span>
                                    {
                                      alumno.matricula
                                    }
                                  </span>

                                </div>
                              </td>


                              {matriz.materias.map(
                                (materia) => (
                                  <td
                                    key={
                                      materia.id
                                    }
                                    className="grades-cell"
                                  >
                                    <input
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.01"
                                      value={
                                        getGradeValue(
                                          alumno,
                                          materia,
                                        )
                                      }
                                      onChange={
                                        (event) =>
                                          changeGrade(
                                            alumno,
                                            materia,
                                            event.target.value,
                                          )
                                      }
                                      placeholder="—"
                                    />
                                  </td>
                                ),
                              )}


                              <td>
                                <strong
                                  className={
                                    nivel ===
                                    "danger"
                                      ? "grades-average grades-average-danger"
                                      :
                                    nivel ===
                                    "warning"
                                      ? "grades-average grades-average-warning"
                                      : "grades-average"
                                  }
                                >
                                  {
                                    promedio ??
                                    "—"
                                  }
                                </strong>
                              </td>


                              <td>

                                {nivel ===
                                "pending" ? (
                                  <span className="grades-state grades-state-pending">
                                    Sin evaluar
                                  </span>
                                ) :
                                nivel ===
                                "danger" ? (
                                  <span className="grades-state grades-state-danger">
                                    <AlertTriangle
                                      size={13}
                                    />

                                    Riesgo alto
                                  </span>
                                ) :
                                nivel ===
                                "warning" ? (
                                  <span className="grades-state grades-state-warning">
                                    <AlertTriangle
                                      size={13}
                                    />

                                    Atención
                                  </span>
                                ) : (
                                  <span className="grades-state grades-state-ok">
                                    En regla
                                  </span>
                                )}

                              </td>

                            </tr>
                          );
                        },
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


export default Calificaciones;