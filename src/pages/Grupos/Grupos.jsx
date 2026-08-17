import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRightLeft,
  ChevronRight,
  GraduationCap,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  deleteAlumno,
  getAlumnoCatalogos,
  getAlumnos,
  updateAlumnoAsignacion,
} from "../../services/alumnosService";

import {
  formatearNombreTabla,
  SEMESTRES,
} from "../../utils/academicUtils";

import "./Grupos.css";


function obtenerGrupoTecnico(
  grupos = [],
) {
  const grupoA =
    grupos.find(
      (grupo) =>
        String(
          grupo.letra || ""
        ).toUpperCase() === "A" ||
        String(
          grupo.nombre || ""
        ).toUpperCase().endsWith(
          "A"
        ),
    );

  return (
    grupoA ||
    grupos[0] ||
    null
  );
}


function Grupos() {
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
    alumnosCarrera,
    setAlumnosCarrera,
  ] = useState([]);

  const [
    alumnosSemestre,
    setAlumnosSemestre,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    editAlumno,
    setEditAlumno,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    carrera_id: "",
    semestre: 1,
    grupo_id: "",
    motivo_cambio: "",
  });

  const [
    formCatalogos,
    setFormCatalogos,
  ] = useState({
    carreras: [],
    semestres: [],
    grupos: [],
  });

  const [
    saving,
    setSaving,
  ] = useState(false);


  async function loadBase() {
    try {
      setLoading(true);

      const data =
        await getAlumnoCatalogos();

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
    loadBase();
  }, []);


  async function seleccionarCarrera(
    item,
  ) {
    try {
      setCarrera(item);
      setSemestre(null);
      setLoading(true);

      const data =
        await getAlumnos({
          carrera_id:
            item.id,
        });

      setAlumnosCarrera(
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


  async function seleccionarSemestre(
    numero,
  ) {
    try {
      setSemestre(
        numero,
      );

      setLoading(true);

      const data =
        await getAlumnos({
          carrera_id:
            carrera.id,

          semestre:
            numero,
      });

      data.sort(
        (a, b) =>
          formatearNombreTabla(
            a.nombre,
          ).localeCompare(
            formatearNombreTabla(
              b.nombre,
            ),
            "es",
          ),
      );

      setAlumnosSemestre(
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


  const conteos =
    useMemo(() => {
      const result = {};

      SEMESTRES.forEach(
        (numero) => {
          result[numero] =
            alumnosCarrera.filter(
              (alumno) =>
                Number(
                  alumno.semestre
                ) === numero,
            ).length;
        },
      );

      return result;
    }, [
      alumnosCarrera,
    ]);


  function volver() {
    if (semestre) {
      setSemestre(null);
      setAlumnosSemestre([]);
      return;
    }

    setCarrera(null);
    setAlumnosCarrera([]);
  }


  async function openAssignment(
    alumno,
  ) {
    try {
      const data =
        await getAlumnoCatalogos(
          alumno.carrera_id,
          alumno.semestre,
        );

      const grupo =
        obtenerGrupoTecnico(
          data.grupos,
        );

      setEditAlumno(
        alumno,
      );

      setFormCatalogos(
        data,
      );

      setForm({
        carrera_id:
          alumno.carrera_id,

        semestre:
          alumno.semestre,

        grupo_id:
          grupo?.id || "",

        motivo_cambio: "",
      });
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  async function academicChange(
    name,
    value,
  ) {
    const next = {
      ...form,

      [name]:
        Number(value),
    };

    setForm(
      next,
    );

    const data =
      await getAlumnoCatalogos(
        next.carrera_id,
        next.semestre,
      );

    const grupo =
      obtenerGrupoTecnico(
        data.grupos,
      );

    setFormCatalogos(
      data,
    );

    setForm(
      (current) => ({
        ...current,

        grupo_id:
          grupo?.id || "",
      }),
    );
  }


  async function saveAssignment(
    event,
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      await updateAlumnoAsignacion(
        editAlumno.id,
        {
          carrera_id:
            Number(
              form.carrera_id
            ),

          semestre:
            Number(
              form.semestre
            ),

          grupo_id:
            form.grupo_id
              ? Number(
                  form.grupo_id
                )
              : null,

          motivo_cambio:
            form.motivo_cambio
              .trim() ||
            "Cambio académico",
        },
      );

      setEditAlumno(
        null,
      );

      await seleccionarCarrera(
        carrera,
      );

      if (
        Number(
          form.carrera_id
        ) ===
        Number(
          carrera.id
        ) &&
        Number(
          form.semestre
        ) ===
        Number(
          semestre
        )
      ) {
        await seleccionarSemestre(
          semestre,
        );
      }
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setSaving(false);
    }
  }


  async function eliminar(
    alumno,
  ) {
    const accepted =
      window.confirm(
        `¿Eliminar a ${alumno.nombre}?`,
      );

    if (!accepted) {
      return;
    }

    try {
      await deleteAlumno(
        alumno.id,
      );

      await seleccionarSemestre(
        semestre,
      );

      const data =
        await getAlumnos({
          carrera_id:
            carrera.id,
      });

      setAlumnosCarrera(
        data,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  return (
    <section className="groups-page">

      <header className="groups-header">
        <div>
          <p className="groups-eyebrow">
            ORGANIZACIÓN ACADÉMICA
          </p>

          <h1>
            Grupos
          </h1>

          <p>
            Cada semestre funciona como
            un grupo académico.
          </p>
        </div>
      </header>


      {error && (
        <div className="groups-error">
          {error}
        </div>
      )}


      {carrera && (
        <button
          type="button"
          className="group-back-button"
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
        <div className="group-career-grid">

          {carreras.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className="group-career-card"
                onClick={() =>
                  seleccionarCarrera(
                    item,
                  )
                }
              >
                <div className="group-card-icon">
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
            <div className="group-selected-title">
              <span>
                Carrera
              </span>

              <h2>
                {carrera.nombre}
              </h2>
            </div>


            <div className="group-semester-grid">

              {SEMESTRES.map(
                (numero) => (
                  <button
                    key={numero}
                    type="button"
                    className="group-semester-card"
                    onClick={() =>
                      seleccionarSemestre(
                        numero,
                      )
                    }
                  >
                    <div className="group-semester-number">
                      {numero}
                    </div>

                    <div>
                      <strong>
                        Semestre {numero}
                      </strong>

                      <span>
                        {
                          conteos[
                            numero
                          ] || 0
                        }
                        {" alumnos"}
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
        semestre && (
          <section className="groups-panel">

            <div className="group-table-title">

              <div>
                <span>
                  {carrera.clave}
                </span>

                <h2>
                  Semestre {semestre}
                </h2>
              </div>

              <div className="group-student-count">
                <UsersRound
                  size={18}
                />

                {alumnosSemestre.length}
                {" alumnos"}
              </div>

            </div>


            <div className="groups-table-wrapper">

              <table className="groups-table">

                <thead>
                  <tr>
                    <th>
                      Alumno
                    </th>

                    <th>
                      Matrícula
                    </th>

                    <th>
                      Carrera
                    </th>

                    <th>
                      Semestre
                    </th>

                    <th>
                      Correo
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Acciones
                    </th>
                  </tr>
                </thead>


                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="group-empty"
                      >
                        Cargando alumnos...
                      </td>
                    </tr>
                  ) :
                  alumnosSemestre.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="group-empty"
                      >
                        No hay alumnos registrados
                        en este semestre.
                      </td>
                    </tr>
                  ) : (
                    alumnosSemestre.map(
                      (alumno) => (
                        <tr
                          key={
                            alumno.id
                          }
                        >
                          <td>
                            <div className="group-student-name">
                              <div className="group-student-avatar">
                                <UserRound
                                  size={17}
                                />
                              </div>

                              <strong>
                                {
                                  formatearNombreTabla(
                                    alumno.nombre,
                                  )
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            {
                              alumno.matricula
                            }
                          </td>

                          <td>
                            {
                              alumno.carrera_clave
                            }
                          </td>

                          <td>
                            {
                              alumno.semestre
                            }
                          </td>

                          <td>
                            {
                              alumno.correo ||
                              "Sin correo"
                            }
                          </td>

                          <td>
                            <span className={`group-student-status group-student-status-${alumno.estado}`}>
                              {
                                alumno.estado
                              }
                            </span>
                          </td>

                          <td>
                            <div className="group-actions">

                              <button
                                type="button"
                                title="Cambiar carrera o semestre"
                                onClick={() =>
                                  openAssignment(
                                    alumno,
                                  )
                                }
                              >
                                <ArrowRightLeft
                                  size={16}
                                />
                              </button>

                              <button
                                type="button"
                                title="Eliminar alumno"
                                onClick={() =>
                                  eliminar(
                                    alumno,
                                  )
                                }
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>

                            </div>
                          </td>
                        </tr>
                      ),
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}


      {editAlumno && (
        <div className="group-modal-backdrop">

          <div className="group-modal">

            <header className="group-modal-header">

              <div>
                <span>
                  CAMBIO ACADÉMICO
                </span>

                <h2>
                  {
                    formatearNombreTabla(
                      editAlumno.nombre,
                    )
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditAlumno(
                    null,
                  )
                }
              >
                <X size={20} />
              </button>

            </header>


            <form
              onSubmit={
                saveAssignment
              }
            >

              <div className="group-form-grid">

                <label>
                  <span>
                    Carrera
                  </span>

                  <select
                    value={
                      form.carrera_id
                    }
                    onChange={
                      (event) =>
                        academicChange(
                          "carrera_id",
                          event.target.value,
                        )
                    }
                  >
                    {formCatalogos.carreras.map(
                      (item) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.nombre
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>


                <label>
                  <span>
                    Semestre
                  </span>

                  <select
                    value={
                      form.semestre
                    }
                    onChange={
                      (event) =>
                        academicChange(
                          "semestre",
                          event.target.value,
                        )
                    }
                  >
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
                </label>


                <label className="group-form-wide">
                  <span>
                    Motivo
                  </span>

                  <textarea
                    value={
                      form.motivo_cambio
                    }
                    onChange={
                      (event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            motivo_cambio:
                              event
                                .target
                                .value,
                          }),
                        )
                    }
                    placeholder="Motivo del cambio"
                  />
                </label>

              </div>


              <footer className="group-modal-footer">

                <button
                  type="button"
                  className="group-cancel-button"
                  onClick={() =>
                    setEditAlumno(
                      null,
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="groups-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : "Guardar cambio"}
                </button>

              </footer>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}


export default Grupos;