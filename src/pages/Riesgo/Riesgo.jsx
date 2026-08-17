import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  getRiesgo,
  getRiesgoCatalogos,
} from "../../services/riesgoService";

import "./Riesgo.css";


const emptyData = {
  resumen: {
    total_alumnos: 0,
    en_riesgo: 0,
    fuera_riesgo: 0,
    sin_evaluacion: 0,
    promedio_general: null,
  },

  alumnos: [],
};


function Riesgo() {
  const [searchParams] =
    useSearchParams();

  const alumnoDesdeCampana =
    searchParams.get(
      "alumno_id",
    ) || "";


  const [data, setData] =
    useState(emptyData);

  const [catalogos, setCatalogos] =
    useState({
      carreras: [],
      semestres: [],
      grupos: [],
      materias: [],
    });

  const [filters, setFilters] =
    useState({
      carrera_id: "",
      semestre: "",
      grupo_id: "",
      materia_id: "",
      estado_riesgo:
        alumnoDesdeCampana
          ? ""
          : "riesgo",
    });

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadBaseCatalogos() {
    try {
      const result =
        await getRiesgoCatalogos();

      setCatalogos(result);
    } catch (err) {
      setError(err.message);
    }
  }


  async function loadRiesgo() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getRiesgo({
          ...filters,

          alumno_id:
            alumnoDesdeCampana,

          search,
        });

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadBaseCatalogos();
  }, []);


  useEffect(() => {
    const timer =
      setTimeout(
        loadRiesgo,
        200,
      );

    return () =>
      clearTimeout(timer);
  }, [
    filters,
    search,
    alumnoDesdeCampana,
  ]);


  async function handleCarrera(
    value,
  ) {
    setFilters(
      (current) => ({
        ...current,

        carrera_id: value,
        semestre: "",
        grupo_id: "",
        materia_id: "",
      }),
    );

    setCatalogos(
      (current) => ({
        ...current,
        grupos: [],
        materias: [],
      }),
    );
  }


  async function handleSemestre(
    value,
  ) {
    const carreraId =
      filters.carrera_id;

    setFilters(
      (current) => ({
        ...current,

        semestre: value,
        grupo_id: "",
        materia_id: "",
      }),
    );

    if (
      !carreraId ||
      !value
    ) {
      return;
    }

    try {
      const result =
        await getRiesgoCatalogos(
          carreraId,
          value,
        );

      setCatalogos(result);
    } catch (err) {
      setError(err.message);
    }
  }


  const resumen =
    data.resumen;


  const porcentajeRiesgo =
    useMemo(() => {
      if (
        resumen.total_alumnos === 0
      ) {
        return 0;
      }

      return (
        (
          resumen.en_riesgo /
          resumen.total_alumnos
        ) *
        100
      ).toFixed(1);
    }, [resumen]);


  return (
    <section className="risk-page">

      <header className="risk-header">
        <div>
          <p className="risk-eyebrow">
            SEGUIMIENTO ACADÉMICO
          </p>

          <h1>
            Riesgo académico
          </h1>

          <p>
            Un alumno entra en riesgo
            cuando su promedio académico
            actual es menor a 7.00.
          </p>
        </div>
      </header>


      <section className="risk-stats">

        <article className="risk-stat-card">
          <div className="risk-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>
              Alumnos analizados
            </span>

            <strong>
              {resumen.total_alumnos}
            </strong>
          </div>
        </article>


        <article className="risk-stat-card risk-stat-danger">
          <div className="risk-stat-icon">
            <ShieldAlert size={21} />
          </div>

          <div>
            <span>
              En riesgo
            </span>

            <strong>
              {resumen.en_riesgo}
            </strong>
          </div>
        </article>


        <article className="risk-stat-card">
          <div className="risk-stat-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>
              Fuera de riesgo
            </span>

            <strong>
              {resumen.fuera_riesgo}
            </strong>
          </div>
        </article>


        <article className="risk-stat-card">
          <div className="risk-stat-icon">
            <BookOpen size={21} />
          </div>

          <div>
            <span>
              Sin evaluación
            </span>

            <strong>
              {resumen.sin_evaluacion}
            </strong>
          </div>
        </article>


        <article className="risk-stat-card">
          <div className="risk-stat-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>
              Promedio general
            </span>

            <strong>
              {resumen.promedio_general ??
                "—"}
            </strong>
          </div>
        </article>

      </section>


      <section className="risk-filter-panel">

        <div className="risk-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar alumno, matrícula, carrera o grupo..."
          />
        </div>


        <select
          value={filters.carrera_id}
          onChange={(event) =>
            handleCarrera(
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
                key={carrera.id}
                value={carrera.id}
              >
                {carrera.clave}
                {" - "}
                {carrera.nombre}
              </option>
            ),
          )}
        </select>


        <select
          value={filters.semestre}
          onChange={(event) =>
            handleSemestre(
              event.target.value,
            )
          }
          disabled={
            !filters.carrera_id
          }
        >
          <option value="">
            Todos los semestres
          </option>

          {catalogos.semestres.map(
            (semestre) => (
              <option
                key={semestre}
                value={semestre}
              >
                Semestre {semestre}
              </option>
            ),
          )}
        </select>


        <select
          value={filters.grupo_id}
          onChange={(event) =>
            setFilters(
              (current) => ({
                ...current,

                grupo_id:
                  event.target.value,
              }),
            )
          }
          disabled={
            !filters.semestre
          }
        >
          <option value="">
            Todos los grupos
          </option>

          {catalogos.grupos.map(
            (grupo) => (
              <option
                key={grupo.id}
                value={grupo.id}
              >
                {grupo.nombre}
              </option>
            ),
          )}
        </select>


        <select
          value={filters.materia_id}
          onChange={(event) =>
            setFilters(
              (current) => ({
                ...current,

                materia_id:
                  event.target.value,
              }),
            )
          }
          disabled={
            !filters.semestre
          }
        >
          <option value="">
            Todas las materias
          </option>

          {catalogos.materias.map(
            (materia) => (
              <option
                key={materia.id}
                value={materia.id}
              >
                {materia.nombre}
              </option>
            ),
          )}
        </select>


        <select
          value={
            filters.estado_riesgo
          }
          onChange={(event) =>
            setFilters(
              (current) => ({
                ...current,

                estado_riesgo:
                  event.target.value,
              }),
            )
          }
        >
          <option value="">
            Todos
          </option>

          <option value="riesgo">
            En riesgo
          </option>

          <option value="sin_riesgo">
            Fuera de riesgo
          </option>

          <option value="sin_evaluacion">
            Sin evaluación
          </option>
        </select>

      </section>


      {error && (
        <div className="risk-error">
          {error}
        </div>
      )}


      <section className="risk-summary-bar">
        <span>
          Porcentaje actual en riesgo
        </span>

        <strong>
          {porcentajeRiesgo}%
        </strong>
      </section>


      <section className="risk-panel">

        <div className="risk-panel-header">
          <div>
            <h2>
              Seguimiento de alumnos
            </h2>

            <p>
              Promedio menor a 7.00
              significa riesgo académico.
            </p>
          </div>
        </div>


        <div className="risk-table-wrapper">

          <table className="risk-table">

            <thead>
              <tr>
                <th>Alumno</th>
                <th>Carrera</th>
                <th>Grupo</th>
                <th>
                  Promedio actual
                </th>
                <th>Evaluadas</th>
                <th>Pendientes</th>
                <th>
                  Debajo de 7
                </th>
                <th>
                  Necesita
                </th>
                <th>Estado</th>
              </tr>
            </thead>


            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="risk-empty"
                  >
                    Analizando información...
                  </td>
                </tr>
              ) : data.alumnos.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="risk-empty"
                  >
                    No hay alumnos para
                    los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                data.alumnos.map(
                  (alumno) => (
                    <tr
                      key={alumno.id}
                      className={
                        alumno.estado_riesgo ===
                        "riesgo"
                          ? "risk-row-danger"
                          : ""
                      }
                    >

                      <td>
                        <div className="risk-student">
                          <strong>
                            {alumno.nombre}
                          </strong>

                          <span>
                            {alumno.matricula}
                          </span>
                        </div>
                      </td>


                      <td>
                        <span className="risk-career">
                          {alumno.carrera_clave}
                        </span>
                      </td>


                      <td>
                        {alumno.grupo}
                      </td>


                      <td>
                        <strong
                          className={
                            alumno.promedio_actual !==
                              null &&
                            alumno.promedio_actual < 7
                              ? "risk-average-danger"
                              : "risk-average-safe"
                          }
                        >
                          {alumno.promedio_actual ??
                            "—"}
                        </strong>
                      </td>


                      <td>
                        {alumno.materias_evaluadas}
                        {" / "}
                        {alumno.total_materias}
                      </td>


                      <td>
                        {alumno.materias_pendientes}
                      </td>


                      <td>
                        {alumno.materias_debajo_7}
                      </td>


                      <td>
                        {alumno.estado_riesgo !==
                        "riesgo" ? (
                          "—"
                        ) : alumno
                            .promedio_necesario_pendientes !==
                          null ? (
                          <div className="risk-needed">
                            <strong>
                              {alumno
                                .promedio_necesario_pendientes}
                            </strong>

                            {!alumno.recuperacion_posible && (
                              <span>
                                Superior a 10
                              </span>
                            )}
                          </div>
                        ) : (
                          "Sin materias pendientes"
                        )}
                      </td>


                      <td>
                        {alumno.estado_riesgo ===
                          "riesgo" && (
                          <span className="risk-badge risk-badge-danger">
                            <AlertTriangle
                              size={13}
                            />

                            En riesgo
                          </span>
                        )}

                        {alumno.estado_riesgo ===
                          "sin_riesgo" && (
                          <span className="risk-badge risk-badge-safe">
                            <CheckCircle2
                              size={13}
                            />

                            Fuera de riesgo
                          </span>
                        )}

                        {alumno.estado_riesgo ===
                          "sin_evaluacion" && (
                          <span className="risk-badge risk-badge-pending">
                            Sin evaluación
                          </span>
                        )}
                      </td>

                    </tr>
                  ),
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </section>
  );
}


export default Riesgo;