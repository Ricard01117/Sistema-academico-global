import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createMateria,
  deleteMateria,
  getMateriaCatalogos,
  getMaterias,
  updateMateria,
  updateMateriaEstado,
} from "../../services/materiasService";

import {
  SEMESTRES,
} from "../../utils/academicUtils";

import "./Materias.css";


const emptyForm = {
  clave: "",
  nombre: "",
  creditos: 5,
  activa: true,
};


function Materias() {
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
    materiasCarrera,
    setMateriasCarrera,
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
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(
    emptyForm,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);


  async function loadCatalogos() {
    try {
      setLoading(true);

      const data =
        await getMateriaCatalogos();

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


  async function loadMateriasCarrera(
    carreraId,
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMaterias({
          carrera_id:
            carreraId,
      });

      setMateriasCarrera(
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


  const materiasSemestre =
    useMemo(
      () =>
        semestre
          ? materiasCarrera.filter(
              (materia) =>
                Number(
                  materia.semestre
                ) ===
                Number(
                  semestre
                ),
            )
          : [],
      [
        materiasCarrera,
        semestre,
      ],
    );


  function seleccionarCarrera(
    item,
  ) {
    setCarrera(item);
    setSemestre(null);

    loadMateriasCarrera(
      item.id,
    );
  }


  function volver() {
    if (semestre) {
      setSemestre(null);
      return;
    }

    setCarrera(null);
    setMateriasCarrera([]);
  }


  function openCreate() {
    setEditing(null);

    setForm({
      ...emptyForm,
    });

    setModalOpen(true);
  }


  function openEdit(
    materia,
  ) {
    setEditing(
      materia,
    );

    setForm({
      clave:
        materia.clave,

      nombre:
        materia.nombre,

      creditos:
        materia.creditos,

      activa:
        materia.activa,
    });

    setModalOpen(true);
  }


  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        carrera_id:
          carrera.id,

        semestre:
          semestre,

        clave:
          form.clave
            .trim()
            .toUpperCase(),

        nombre:
          form.nombre
            .trim(),

        creditos:
          Number(
            form.creditos
          ),

        activa:
          form.activa,
      };

      if (editing) {
        await updateMateria(
          editing.id,
          payload,
        );
      } else {
        await createMateria(
          payload,
        );
      }

      setModalOpen(false);

      await loadMateriasCarrera(
        carrera.id,
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setSaving(false);
    }
  }


  async function toggleEstado(
    materia,
  ) {
    try {
      await updateMateriaEstado(
        materia.id,
        !materia.activa,
        carrera.id,
        semestre,
      );

      await loadMateriasCarrera(
        carrera.id,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  async function handleDelete(
    materia,
  ) {
    const accepted =
      window.confirm(
        `¿Eliminar "${materia.nombre}"?`,
      );

    if (!accepted) {
      return;
    }

    try {
      setError("");

      try {
        await deleteMateria(
          materia.id,
        );
      } catch {
        /*
         * Si ya existe historial académico,
         * no destruimos esos registros.
         * La materia queda inactiva.
         */
        await updateMateriaEstado(
          materia.id,
          false,
        );
      }

      await loadMateriasCarrera(
        carrera.id,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }


  if (loading && !carrera) {
    return (
      <section className="subjects-page">
        <div className="academic-empty">
          Cargando carreras...
        </div>
      </section>
    );
  }


  return (
    <section className="subjects-page">

      <header className="subjects-header">
        <div>
          <p className="subjects-eyebrow">
            PLAN ACADÉMICO
          </p>

          <h1>
            Materias
          </h1>

          <p>
            Organiza las materias por
            carrera y semestre.
          </p>
        </div>

        {semestre && (
          <button
            type="button"
            className="subjects-primary-button"
            onClick={
              openCreate
            }
          >
            <Plus size={18} />
            Agregar materia
          </button>
        )}
      </header>


      {error && (
        <div className="subjects-error">
          {error}
        </div>
      )}


      {carrera && (
        <button
          type="button"
          className="academic-back-button"
          onClick={volver}
        >
          <ArrowLeft size={17} />

          {semestre
            ? `Volver a semestres de ${carrera.clave}`
            : "Volver a carreras"}
        </button>
      )}


      {!carrera && (
        <div className="academic-career-grid">

          {carreras.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className="academic-career-card"
                onClick={() =>
                  seleccionarCarrera(
                    item,
                  )
                }
              >
                <div className="academic-card-icon">
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
            <div className="academic-selected-title">
              <span>
                Carrera seleccionada
              </span>

              <h2>
                {carrera.nombre}
              </h2>
            </div>


            <div className="academic-semester-grid">

              {SEMESTRES.map(
                (numero) => {
                  const cantidad =
                    materiasCarrera.filter(
                      (materia) =>
                        Number(
                          materia.semestre
                        ) === numero &&
                        materia.activa,
                    ).length;

                  return (
                    <button
                      key={numero}
                      type="button"
                      className="academic-semester-card"
                      onClick={() =>
                        setSemestre(
                          numero,
                        )
                      }
                    >
                      <div className="academic-semester-number">
                        {numero}
                      </div>

                      <div>
                        <strong>
                          Semestre {numero}
                        </strong>

                        <span>
                          {cantidad}
                          {" "}
                          {cantidad === 1
                            ? "materia"
                            : "materias"}
                        </span>
                      </div>

                      <ChevronRight
                        size={18}
                      />
                    </button>
                  );
                },
              )}

            </div>
          </>
        )}


      {carrera &&
        semestre && (
          <section className="subjects-panel">

            <div className="academic-table-title">
              <div>
                <span>
                  {carrera.clave}
                </span>

                <h2>
                  Semestre {semestre}
                </h2>
              </div>

              <div className="academic-count">
                <BookOpen
                  size={17}
                />

                {
                  materiasSemestre
                    .filter(
                      (item) =>
                        item.activa,
                    )
                    .length
                }
                {" materias activas"}
              </div>
            </div>


            <div className="subjects-table-wrapper">
              <table className="subjects-table">

                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Clave</th>
                    <th>Créditos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>


                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="academic-empty"
                      >
                        Cargando...
                      </td>
                    </tr>
                  ) :
                  materiasSemestre.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="academic-empty"
                      >
                        Todavía no hay materias
                        en este semestre.
                      </td>
                    </tr>
                  ) : (
                    materiasSemestre.map(
                      (materia) => (
                        <tr
                          key={
                            materia.id
                          }
                        >
                          <td>
                            <div className="subject-name-cell">
                              <BookOpen
                                size={18}
                              />

                              <strong>
                                {
                                  materia.nombre
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span className="subject-code">
                              {
                                materia.clave
                              }
                            </span>
                          </td>

                          <td>
                            {
                              materia.creditos
                            }
                          </td>

                          <td>
                            <button
                              type="button"
                              className={
                                materia.activa
                                  ? "subject-status subject-status-active"
                                  : "subject-status subject-status-inactive"
                              }
                              onClick={() =>
                                toggleEstado(
                                  materia,
                                )
                              }
                            >
                              {materia.activa
                                ? "Activa"
                                : "Inactiva"}
                            </button>
                          </td>

                          <td>
                            <div className="subject-actions">

                              <button
                                type="button"
                                title="Editar"
                                onClick={() =>
                                  openEdit(
                                    materia,
                                  )
                                }
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              <button
                                type="button"
                                title="Eliminar"
                                onClick={() =>
                                  handleDelete(
                                    materia,
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


      {modalOpen && (
        <div className="subject-modal-backdrop">

          <div className="subject-modal">

            <header className="subject-modal-header">
              <div>
                <span>
                  {editing
                    ? "EDITAR MATERIA"
                    : "NUEVA MATERIA"}
                </span>

                <h2>
                  {carrera.clave}
                  {" · Semestre "}
                  {semestre}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
              >
                <X size={20} />
              </button>
            </header>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="subject-form-grid">

                <label>
                  <span>
                    Clave
                  </span>

                  <input
                    value={
                      form.clave
                    }
                    onChange={
                      (event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            clave:
                              event
                                .target
                                .value,
                          }),
                        )
                    }
                    required
                  />
                </label>


                <label>
                  <span>
                    Créditos
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={
                      form.creditos
                    }
                    onChange={
                      (event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            creditos:
                              event
                                .target
                                .value,
                          }),
                        )
                    }
                    required
                  />
                </label>


                <label className="subject-form-wide">
                  <span>
                    Nombre de la materia
                  </span>

                  <input
                    value={
                      form.nombre
                    }
                    onChange={
                      (event) =>
                        setForm(
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


                <label className="subject-active-control">

                  <input
                    type="checkbox"
                    checked={
                      form.activa
                    }
                    onChange={
                      (event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            activa:
                              event
                                .target
                                .checked,
                          }),
                        )
                    }
                  />

                  <div>
                    <strong>
                      Materia activa
                    </strong>

                    <span>
                      Aparecerá automáticamente
                      en Calificaciones para
                      todos los alumnos de este
                      semestre.
                    </span>
                  </div>

                </label>

              </div>


              <footer className="subject-modal-footer">

                <button
                  type="button"
                  className="subject-cancel-button"
                  onClick={() =>
                    setModalOpen(
                      false,
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="subjects-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : "Guardar materia"}
                </button>

              </footer>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}


export default Materias;