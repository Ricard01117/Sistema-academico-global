import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRightLeft,
  GraduationCap,
  History,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  createAlumno,
  deleteAlumno,
  getAlumnoCatalogos,
  getAlumnoHistorial,
  getAlumnos,
  updateAlumno,
  updateAlumnoAsignacion,
} from "../../services/alumnosService";

import {
  SEMESTRES,
} from "../../utils/academicUtils";

import "./Alumnos.css";


const initialCreate = {
  nombre: "",
  correo: "",
  carrera_id: "",
  semestre: 1,
  grupo_id: "",
  estado: "activo",
};


function grupoTecnico(
  grupos = [],
) {
  return (
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
    ) ||
    grupos[0] ||
    null
  );
}


function Alumnos() {
  const [
    alumnos,
    setAlumnos,
  ] = useState([]);

  const [
    catalogos,
    setCatalogos,
  ] = useState({
    carreras: [],
    semestres: [],
    grupos: [],
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filtroCarrera,
    setFiltroCarrera,
  ] = useState("");

  const [
    filtroSemestre,
    setFiltroSemestre,
  ] = useState("");

  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState("");

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    assignmentOpen,
    setAssignmentOpen,
  ] = useState(false);

  const [
    historyOpen,
    setHistoryOpen,
  ] = useState(false);

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    createForm,
    setCreateForm,
  ] = useState(
    initialCreate,
  );

  const [
    editForm,
    setEditForm,
  ] = useState({
    nombre: "",
    correo: "",
    estado: "activo",
  });

  const [
    assignmentForm,
    setAssignmentForm,
  ] = useState({
    carrera_id: "",
    semestre: 1,
    grupo_id: "",
    motivo_cambio: "",
  });

  const [
    historial,
    setHistorial,
  ] = useState([]);

  const [
    saving,
    setSaving,
  ] = useState(false);


  async function loadCatalogos() {
    try {
      const data =
        await getAlumnoCatalogos();

      setCatalogos(
        data,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  async function loadAlumnos() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAlumnos({
          search,

          carrera_id:
            filtroCarrera,

          semestre:
            filtroSemestre,

          estado:
            filtroEstado,
      });

      setAlumnos(
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
    loadCatalogos();
  }, []);


  useEffect(() => {
    const timeout =
      setTimeout(
        loadAlumnos,
        200,
      );

    return () =>
      clearTimeout(
        timeout,
      );
  }, [
    search,
    filtroCarrera,
    filtroSemestre,
    filtroEstado,
  ]);


  const stats =
    useMemo(
      () => ({
        total:
          alumnos.length,

        activos:
          alumnos.filter(
            (item) =>
              item.estado ===
              "activo",
          ).length,

        bajas:
          alumnos.filter(
            (item) =>
              item.estado ===
              "baja",
          ).length,

        egresados:
          alumnos.filter(
            (item) =>
              item.estado ===
              "egresado",
          ).length,
      }),
      [alumnos],
    );


  async function resolveAcademic(
    carreraId,
    semestre,
  ) {
    const data =
      await getAlumnoCatalogos(
        carreraId,
        semestre,
      );

    const grupo =
      grupoTecnico(
        data.grupos,
      );

    return {
      data,
      grupo,
    };
  }


  async function openCreate() {
    try {
      const base =
        await getAlumnoCatalogos();

      const firstCareer =
        base.carreras[0];

      const carreraId =
        firstCareer?.id || "";

      let groupId = "";

      if (carreraId) {
        const result =
          await resolveAcademic(
            carreraId,
            1,
          );

        groupId =
          result.grupo?.id ||
          "";
      }

      setCreateForm({
        ...initialCreate,

        carrera_id:
          carreraId,

        semestre: 1,

        grupo_id:
          groupId,
      });

      setCreateOpen(
        true,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  async function createAcademicChange(
    name,
    value,
  ) {
    const next = {
      ...createForm,

      [name]:
        Number(value),
    };

    setCreateForm(
      next,
    );

    const result =
      await resolveAcademic(
        next.carrera_id,
        next.semestre,
      );

    setCreateForm(
      (current) => ({
        ...current,

        grupo_id:
          result.grupo?.id ||
          "",
      }),
    );
  }


  async function submitCreate(
    event,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createAlumno({
        nombre:
          createForm.nombre
            .trim(),

        correo:
          createForm.correo
            .trim() ||
          null,

        carrera_id:
          Number(
            createForm.carrera_id
          ),

        semestre:
          Number(
            createForm.semestre
          ),

        grupo_id:
          createForm.grupo_id
            ? Number(
                createForm.grupo_id
              )
            : null,

        estado:
          createForm.estado,
      });

      setCreateOpen(
        false,
      );

      await loadAlumnos();
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setSaving(false);
    }
  }


  function openEdit(
    alumno,
  ) {
    setSelected(
      alumno,
    );

    setEditForm({
      nombre:
        alumno.nombre,

      correo:
        alumno.correo ||
        "",

      estado:
        alumno.estado,
    });

    setEditOpen(
      true,
    );
  }


  async function submitEdit(
    event,
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      await updateAlumno(
        selected.id,
        {
          nombre:
            editForm.nombre
              .trim(),

          correo:
            editForm.correo
              .trim() ||
            null,

          estado:
            editForm.estado,
        },
      );

      setEditOpen(
        false,
      );

      await loadAlumnos();
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setSaving(false);
    }
  }


  async function openAssignment(
    alumno,
  ) {
    try {
      const result =
        await resolveAcademic(
          alumno.carrera_id,
          alumno.semestre,
        );

      setSelected(
        alumno,
      );

      setAssignmentForm({
        carrera_id:
          alumno.carrera_id,

        semestre:
          alumno.semestre,

        grupo_id:
          result.grupo?.id ||
          "",

        motivo_cambio:
          "",
      });

      setAssignmentOpen(
        true,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  async function assignmentAcademicChange(
    name,
    value,
  ) {
    const next = {
      ...assignmentForm,

      [name]:
        Number(value),
    };

    setAssignmentForm(
      next,
    );

    const result =
      await resolveAcademic(
        next.carrera_id,
        next.semestre,
      );

    setAssignmentForm(
      (current) => ({
        ...current,

        grupo_id:
          result.grupo?.id ||
          "",
      }),
    );
  }


  async function submitAssignment(
    event,
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      await updateAlumnoAsignacion(
        selected.id,
        {
          carrera_id:
            Number(
              assignmentForm
                .carrera_id
            ),

          semestre:
            Number(
              assignmentForm
                .semestre
            ),

          grupo_id:
            assignmentForm
              .grupo_id
              ? Number(
                  assignmentForm
                    .grupo_id
                )
              : null,

          motivo_cambio:
            assignmentForm
              .motivo_cambio
              .trim() ||
            "Cambio académico",
        },
      );

      setAssignmentOpen(
        false,
      );

      await loadAlumnos();
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setSaving(false);
    }
  }


  async function openHistory(
    alumno,
  ) {
    try {
      setSelected(
        alumno,
      );

      const data =
        await getAlumnoHistorial(
          alumno.id,
        );

      setHistorial(
        data,
      );

      setHistoryOpen(
        true,
      );
    } catch (err) {
      setError(
        err.message,
      );
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

      await loadAlumnos();
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  return (
    <section className="students-page">

      <header className="students-header">
        <div>
          <p className="students-eyebrow">
            CONTROL ESCOLAR
          </p>

          <h1>
            Alumnos
          </h1>

          <p>
            Registra nombre, carrera y
            semestre. El resto de la
            asignación académica es
            automática.
          </p>
        </div>

        <button
          type="button"
          className="students-primary-button"
          onClick={
            openCreate
          }
        >
          <Plus size={18} />
          Nuevo alumno
        </button>
      </header>


      <section className="students-stats">

        <Stat
          icon={<Users />}
          text="Total alumnos"
          value={stats.total}
        />

        <Stat
          icon={<UserCheck />}
          text="Activos"
          value={stats.activos}
        />

        <Stat
          icon={<UserRound />}
          text="Bajas"
          value={stats.bajas}
        />

        <Stat
          icon={<GraduationCap />}
          text="Egresados"
          value={stats.egresados}
        />

      </section>


      <section className="students-panel">

        <div className="students-toolbar">

          <div className="students-search">
            <Search size={18} />

            <input
              value={search}
              onChange={
                (event) =>
                  setSearch(
                    event.target.value,
                  )
              }
              placeholder="Buscar alumno o matrícula..."
            />
          </div>


          <select
            className="students-filter"
            value={
              filtroCarrera
            }
            onChange={
              (event) =>
                setFiltroCarrera(
                  event.target.value,
                )
            }
          >
            <option value="">
              Todas las carreras
            </option>

            {catalogos.carreras.map(
              (item) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.id
                  }
                >
                  {item.clave}
                </option>
              ),
            )}
          </select>


          <select
            className="students-filter"
            value={
              filtroSemestre
            }
            onChange={
              (event) =>
                setFiltroSemestre(
                  event.target.value,
                )
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


          <select
            className="students-filter"
            value={
              filtroEstado
            }
            onChange={
              (event) =>
                setFiltroEstado(
                  event.target.value,
                )
            }
          >
            <option value="">
              Todos
            </option>
            <option value="activo">
              Activo
            </option>
            <option value="baja">
              Baja
            </option>
            <option value="egresado">
              Egresado
            </option>
          </select>

        </div>


        {error && (
          <div className="students-error">
            {error}
          </div>
        )}


        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>
              <tr>
                <th>Alumno</th>
                <th>Matrícula</th>
                <th>Carrera</th>
                <th>Semestre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>


            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="students-empty"
                  >
                    Cargando alumnos...
                  </td>
                </tr>
              ) :
              alumnos.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="students-empty"
                  >
                    No hay alumnos registrados.
                  </td>
                </tr>
              ) : (
                alumnos.map(
                  (alumno) => (
                    <tr
                      key={
                        alumno.id
                      }
                    >

                      <td>
                        <div className="student-name-cell">

                          <div className="student-avatar">
                            <UserRound
                              size={18}
                            />
                          </div>

                          <div>
                            <strong>
                              {
                                alumno.nombre
                              }
                            </strong>

                            <span>
                              <Mail
                                size={12}
                              />

                              {
                                alumno.correo ||
                                "Sin correo"
                              }
                            </span>
                          </div>

                        </div>
                      </td>


                      <td>
                        <span className="student-matricula">
                          {
                            alumno.matricula
                          }
                        </span>
                      </td>


                      <td>
                        {
                          alumno.carrera_clave
                        }
                      </td>


                      <td>
                        Semestre {
                          alumno.semestre
                        }
                      </td>


                      <td>
                        <span className={`student-status student-status-${alumno.estado}`}>
                          {
                            alumno.estado
                          }
                        </span>
                      </td>


                      <td>
                        <div className="student-actions">

                          <button
                            type="button"
                            title="Editar datos"
                            onClick={() =>
                              openEdit(
                                alumno,
                              )
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

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
                            title="Historial"
                            onClick={() =>
                              openHistory(
                                alumno,
                              )
                            }
                          >
                            <History
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            title="Eliminar"
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


      {createOpen && (
        <StudentModal
          title="Registrar alumno"
          eyebrow="NUEVO ALUMNO"
          close={() =>
            setCreateOpen(
              false,
            )
          }
        >
          <form
            onSubmit={
              submitCreate
            }
          >

            <div className="student-form-grid">

              <label className="student-form-wide">
                <span>
                  Nombre completo
                </span>

                <input
                  value={
                    createForm.nombre
                  }
                  onChange={
                    (event) =>
                      setCreateForm(
                        (current) => ({
                          ...current,

                          nombre:
                            event
                              .target
                              .value,
                        }),
                      )
                  }
                  placeholder="Ricardo Castro Castro"
                  required
                />
              </label>


              <label className="student-form-wide">
                <span>
                  Correo
                </span>

                <input
                  type="email"
                  value={
                    createForm.correo
                  }
                  onChange={
                    (event) =>
                      setCreateForm(
                        (current) => ({
                          ...current,

                          correo:
                            event
                              .target
                              .value,
                        }),
                      )
                  }
                />
              </label>


              <label>
                <span>
                  Carrera
                </span>

                <select
                  value={
                    createForm.carrera_id
                  }
                  onChange={
                    (event) =>
                      createAcademicChange(
                        "carrera_id",
                        event.target.value,
                      )
                  }
                  required
                >
                  {catalogos.carreras.map(
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
                    createForm.semestre
                  }
                  onChange={
                    (event) =>
                      createAcademicChange(
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


              <label className="student-form-wide">
                <span>
                  Estado
                </span>

                <select
                  value={
                    createForm.estado
                  }
                  onChange={
                    (event) =>
                      setCreateForm(
                        (current) => ({
                          ...current,

                          estado:
                            event
                              .target
                              .value,
                        }),
                      )
                  }
                >
                  <option value="activo">
                    Activo
                  </option>

                  <option value="baja">
                    Baja
                  </option>

                  <option value="egresado">
                    Egresado
                  </option>
                </select>
              </label>


              <div className="student-auto-info">
                <strong>
                  Asignación automática
                </strong>

                <span>
                  Matrícula, grupo técnico,
                  materias y registros de
                  calificaciones se generarán
                  automáticamente.
                </span>
              </div>

            </div>

            <ModalFooter
              saving={saving}
              close={() =>
                setCreateOpen(
                  false,
                )
              }
              text="Registrar alumno"
            />

          </form>
        </StudentModal>
      )}


      {editOpen &&
        selected && (
          <StudentModal
            title={
              selected.nombre
            }
            eyebrow="EDITAR ALUMNO"
            close={() =>
              setEditOpen(
                false,
              )
            }
          >

            <form
              onSubmit={
                submitEdit
              }
            >

              <div className="student-form-grid">

                <label className="student-form-wide">
                  <span>
                    Nombre completo
                  </span>

                  <input
                    value={
                      editForm.nombre
                    }
                    onChange={
                      (event) =>
                        setEditForm(
                          (current) => ({
                            ...current,

                            nombre:
                              event
                                .target
                                .value,
                          }),
                        )
                    }
                    required
                  />
                </label>


                <label className="student-form-wide">
                  <span>
                    Correo
                  </span>

                  <input
                    type="email"
                    value={
                      editForm.correo
                    }
                    onChange={
                      (event) =>
                        setEditForm(
                          (current) => ({
                            ...current,

                            correo:
                              event
                                .target
                                .value,
                          }),
                        )
                    }
                  />
                </label>


                <label className="student-form-wide">
                  <span>
                    Estado
                  </span>

                  <select
                    value={
                      editForm.estado
                    }
                    onChange={
                      (event) =>
                        setEditForm(
                          (current) => ({
                            ...current,

                            estado:
                              event
                                .target
                                .value,
                          }),
                        )
                    }
                  >
                    <option value="activo">
                      Activo
                    </option>

                    <option value="baja">
                      Baja
                    </option>

                    <option value="egresado">
                      Egresado
                    </option>
                  </select>
                </label>

              </div>

              <ModalFooter
                saving={saving}
                close={() =>
                  setEditOpen(
                    false,
                  )
                }
                text="Guardar cambios"
              />

            </form>

          </StudentModal>
        )}


      {assignmentOpen &&
        selected && (
          <StudentModal
            title={
              selected.nombre
            }
            eyebrow="CAMBIO ACADÉMICO"
            close={() =>
              setAssignmentOpen(
                false,
              )
            }
          >

            <form
              onSubmit={
                submitAssignment
              }
            >

              <div className="student-form-grid">

                <label>
                  <span>
                    Carrera
                  </span>

                  <select
                    value={
                      assignmentForm.carrera_id
                    }
                    onChange={
                      (event) =>
                        assignmentAcademicChange(
                          "carrera_id",
                          event.target.value,
                        )
                    }
                  >
                    {catalogos.carreras.map(
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
                      assignmentForm.semestre
                    }
                    onChange={
                      (event) =>
                        assignmentAcademicChange(
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


                <label className="student-form-wide">
                  <span>
                    Motivo
                  </span>

                  <textarea
                    value={
                      assignmentForm
                        .motivo_cambio
                    }
                    onChange={
                      (event) =>
                        setAssignmentForm(
                          (current) => ({
                            ...current,

                            motivo_cambio:
                              event
                                .target
                                .value,
                          }),
                        )
                    }
                  />
                </label>

              </div>

              <ModalFooter
                saving={saving}
                close={() =>
                  setAssignmentOpen(
                    false,
                  )
                }
                text="Guardar asignación"
              />

            </form>

          </StudentModal>
        )}


      {historyOpen &&
        selected && (
          <StudentModal
            title={
              selected.nombre
            }
            eyebrow="HISTORIAL ACADÉMICO"
            close={() =>
              setHistoryOpen(
                false,
              )
            }
          >

            <div className="student-history-content">

              {historial.length ===
              0 ? (
                <div className="students-empty">
                  Sin historial.
                </div>
              ) : (
                historial.map(
                  (item) => (
                    <article
                      key={
                        item.inscripcion_id
                      }
                      className="student-history-item"
                    >

                      <div>
                        <span>
                          Carrera
                        </span>

                        <strong>
                          {
                            item.carrera_nombre
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Semestre
                        </span>

                        <strong>
                          {
                            item.semestre
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Periodo
                        </span>

                        <strong>
                          {
                            item.periodo_nombre
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Estado
                        </span>

                        <strong>
                          {item.activa
                            ? "Actual"
                            : "Histórico"}
                        </strong>
                      </div>

                    </article>
                  ),
                )
              )}

            </div>

          </StudentModal>
        )}

    </section>
  );
}


function Stat({
  icon,
  text,
  value,
}) {
  return (
    <article className="student-stat-card">

      <div className="student-stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {text}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </article>
  );
}


function StudentModal({
  title,
  eyebrow,
  close,
  children,
}) {
  return (
    <div className="student-modal-backdrop">

      <div className="student-modal">

        <header className="student-modal-header">

          <div>
            <span>
              {eyebrow}
            </span>

            <h2>
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              close
            }
          >
            <X size={20} />
          </button>

        </header>

        {children}

      </div>

    </div>
  );
}


function ModalFooter({
  saving,
  close,
  text,
}) {
  return (
    <footer className="student-modal-footer">

      <button
        type="button"
        className="student-cancel-button"
        onClick={
          close
        }
      >
        Cancelar
      </button>

      <button
        type="submit"
        className="students-primary-button"
        disabled={
          saving
        }
      >
        {saving
          ? "Guardando..."
          : text}
      </button>

    </footer>
  );
}


export default Alumnos;