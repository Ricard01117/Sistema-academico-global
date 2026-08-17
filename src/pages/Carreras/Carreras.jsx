import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  createCarrera,
  deleteCarrera,
  getCarreras,
  updateCarrera,
  updateCarreraEstado,
} from "../../services/carrerasService";

import "./Carreras.css";


const initialForm = {
  nombre: "",
  clave: "",
  activa: true,
};


function Carreras() {
  const [carreras, setCarreras] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filtroActiva, setFiltroActiva] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingCarrera, setEditingCarrera] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);


  async function loadCarreras() {
    try {
      setLoading(true);
      setError("");

      const data = await getCarreras({
        search,
        activa: filtroActiva,
      });

      setCarreras(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const timer = setTimeout(() => {
      loadCarreras();
    }, 250);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    filtroActiva,
  ]);


  const estadisticas = useMemo(() => {
    const activas = carreras.filter(
      (carrera) => carrera.activa,
    ).length;

    const inactivas = carreras.filter(
      (carrera) => !carrera.activa,
    ).length;

    return {
      total: carreras.length,
      activas,
      inactivas,
      semestres:
        carreras.length * 12,
    };
  }, [carreras]);


  function openCreateModal() {
    setEditingCarrera(null);

    setForm(initialForm);

    setModalOpen(true);
  }


  function openEditModal(carrera) {
    setEditingCarrera(carrera);

    setForm({
      nombre: carrera.nombre,
      clave: carrera.clave,
      activa: carrera.activa,
    });

    setModalOpen(true);
  }


  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingCarrera(null);
    setForm(initialForm);
  }


  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        nombre:
          form.nombre.trim(),

        clave:
          form.clave
            .trim()
            .toUpperCase(),

        activa:
          form.activa,
      };

      if (editingCarrera) {
        await updateCarrera(
          editingCarrera.id,
          payload,
        );
      } else {
        await createCarrera(
          payload,
        );
      }

      setModalOpen(false);

      setEditingCarrera(null);

      setForm(initialForm);

      await loadCarreras();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  async function handleEstado(carrera) {
    try {
      setError("");

      await updateCarreraEstado(
        carrera.id,
        !carrera.activa,
      );

      await loadCarreras();
    } catch (err) {
      setError(err.message);
    }
  }


  async function handleDelete(carrera) {
    const accepted =
      window.confirm(
        `¿Eliminar la carrera "${carrera.nombre}"?`,
      );

    if (!accepted) {
      return;
    }

    try {
      setError("");

      await deleteCarrera(
        carrera.id,
      );

      await loadCarreras();
    } catch (err) {
      setError(err.message);
    }
  }


  return (
    <section className="careers-page">
      <header className="careers-header">
        <div>
          <p className="careers-eyebrow">
            ESTRUCTURA ACADÉMICA
          </p>

          <h1>Carreras</h1>

          <p>
            Administra las carreras disponibles
            en el sistema académico.
          </p>
        </div>

        <button
          type="button"
          className="careers-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />

          Nueva carrera
        </button>
      </header>


      <section className="careers-stats">
        <article className="career-stat-card">
          <div className="career-stat-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>
              Total carreras
            </span>

            <strong>
              {estadisticas.total}
            </strong>
          </div>
        </article>


        <article className="career-stat-card">
          <div className="career-stat-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>
              Carreras activas
            </span>

            <strong>
              {estadisticas.activas}
            </strong>
          </div>
        </article>


        <article className="career-stat-card">
          <div className="career-stat-icon">
            <XCircle size={21} />
          </div>

          <div>
            <span>
              Inactivas
            </span>

            <strong>
              {estadisticas.inactivas}
            </strong>
          </div>
        </article>


        <article className="career-stat-card">
          <div className="career-stat-icon">
            <BookOpen size={21} />
          </div>

          <div>
            <span>
              Semestres disponibles
            </span>

            <strong>
              {estadisticas.semestres}
            </strong>
          </div>
        </article>
      </section>


      <section className="careers-panel">
        <div className="careers-toolbar">
          <div className="careers-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar por nombre o clave..."
            />
          </div>


          <select
            className="careers-filter"
            value={filtroActiva}
            onChange={(event) =>
              setFiltroActiva(
                event.target.value,
              )
            }
          >
            <option value="">
              Todas las carreras
            </option>

            <option value="true">
              Activas
            </option>

            <option value="false">
              Inactivas
            </option>
          </select>
        </div>


        {error && (
          <div className="careers-error">
            {error}
          </div>
        )}


        <div className="careers-table-wrapper">
          <table className="careers-table">
            <thead>
              <tr>
                <th>Carrera</th>
                <th>Clave</th>
                <th>Semestres</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="careers-empty"
                  >
                    Cargando carreras...
                  </td>
                </tr>
              ) : careersEmpty(
                carreras,
              ) ? (
                <tr>
                  <td
                    colSpan="5"
                    className="careers-empty"
                  >
                    No hay carreras registradas.
                  </td>
                </tr>
              ) : (
                carreras.map(
                  (carrera) => (
                    <tr key={carrera.id}>
                      <td>
                        <div className="career-name-cell">
                          <div className="career-icon">
                            <GraduationCap
                              size={18}
                            />
                          </div>

                          <strong>
                            {carrera.nombre}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="career-code">
                          {carrera.clave}
                        </span>
                      </td>

                      <td>
                        <span className="career-semesters">
                          1 al 12
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            carrera.activa
                              ? "career-status career-status-active"
                              : "career-status career-status-inactive"
                          }
                          onClick={() =>
                            handleEstado(
                              carrera,
                            )
                          }
                          title="Cambiar estado"
                        >
                          {carrera.activa
                            ? "Activa"
                            : "Inactiva"}
                        </button>
                      </td>

                      <td>
                        <div className="career-actions">
                          <button
                            type="button"
                            title="Editar carrera"
                            onClick={() =>
                              openEditModal(
                                carrera,
                              )
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            className="career-delete-button"
                            title="Eliminar carrera"
                            onClick={() =>
                              handleDelete(
                                carrera,
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


      {modalOpen && (
        <div className="career-modal-backdrop">
          <div className="career-modal">
            <header className="career-modal-header">
              <div>
                <span>
                  {editingCarrera
                    ? "EDITAR CARRERA"
                    : "NUEVA CARRERA"}
                </span>

                <h2>
                  {editingCarrera
                    ? "Modificar carrera"
                    : "Registrar carrera"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </header>


            <form
              onSubmit={handleSubmit}
            >
              <div className="career-form-grid">
                <label className="career-form-wide">
                  <span>
                    Nombre de la carrera
                  </span>

                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ingeniería Mecánica"
                    required
                  />
                </label>


                <label>
                  <span>
                    Clave o abreviatura
                  </span>

                  <input
                    name="clave"
                    value={form.clave}
                    onChange={handleChange}
                    placeholder="MEC"
                    maxLength="15"
                    required
                  />
                </label>


                <div className="career-semester-info">
                  <span>
                    Semestres
                  </span>

                  <strong>
                    1 al 12
                  </strong>
                </div>


                <label className="career-active-control">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={form.activa}
                    onChange={handleChange}
                  />

                  <div>
                    <strong>
                      Carrera activa
                    </strong>

                    <span>
                      Disponible para materias,
                      grupos y alumnos.
                    </span>
                  </div>
                </label>
              </div>


              <footer className="career-modal-footer">
                <button
                  type="button"
                  className="career-cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="careers-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingCarrera
                      ? "Guardar cambios"
                      : "Registrar carrera"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}


function careersEmpty(carreras) {
  return carreras.length === 0;
}


export default Carreras;