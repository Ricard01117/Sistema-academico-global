import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UsersRound,
  UserX,
  X,
} from "lucide-react";

import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
  updateUsuarioEstado,
  updateUsuarioPassword,
} from "../../services/usuariosService";

import "./Usuarios.css";


const initialForm = {
  nombre: "",
  correo: "",
  password: "",
  rol: "maestro",
  activo: true,
  es_demo: false,
};


function Usuarios() {
  const [
    usuarios,
    setUsuarios,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    rolFilter,
    setRolFilter,
  ] = useState("");

  const [
    estadoFilter,
    setEstadoFilter,
  ] = useState("");

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
  ] = useState(initialForm);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    passwordModal,
    setPasswordModal,
  ] = useState(null);

  const [
    newPassword,
    setNewPassword,
  ] = useState("");


  async function loadUsuarios() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getUsuarios({
          search,
          rol: rolFilter,
          activo: estadoFilter,
        });

      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadUsuarios();
      }, 250);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    rolFilter,
    estadoFilter,
  ]);


  const stats = useMemo(() => {
    const activos =
      usuarios.filter(
        (item) => item.activo,
      ).length;

    const administradores =
      usuarios.filter(
        (item) =>
          item.rol ===
          "administrador",
      ).length;

    const maestros =
      usuarios.filter(
        (item) =>
          item.rol === "maestro",
      ).length;

    const demos =
      usuarios.filter(
        (item) => item.es_demo,
      ).length;

    return {
      total: usuarios.length,
      activos,
      administradores,
      maestros,
      demos,
    };
  }, [usuarios]);


  function openCreateModal() {
    setEditing(null);

    setForm(initialForm);

    setModalOpen(true);
  }


  function openEditModal(usuario) {
    setEditing(usuario);

    setForm({
      nombre:
        usuario.nombre,

      correo:
        usuario.correo,

      password: "",

      rol:
        usuario.rol,

      activo:
        usuario.activo,

      es_demo:
        usuario.es_demo,
    });

    setModalOpen(true);
  }


  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
  }


  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      }),
    );
  }


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editing) {
        await updateUsuario(
          editing.id,
          {
            nombre:
              form.nombre,

            correo:
              form.correo,

            rol:
              form.rol,

            activo:
              form.activo,

            es_demo:
              form.es_demo,
          },
        );
      } else {
        await createUsuario({
          nombre:
            form.nombre,

          correo:
            form.correo,

          password:
            form.password,

          rol:
            form.rol,

          activo:
            form.activo,

          es_demo:
            form.es_demo,
        });
      }

      closeModal();

      await loadUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  async function handleStatus(
    usuario,
  ) {
    try {
      setError("");

      await updateUsuarioEstado(
        usuario.id,
        !usuario.activo,
      );

      await loadUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }


  async function handleDelete(
    usuario,
  ) {
    const accepted =
      window.confirm(
        `¿Eliminar al usuario ${usuario.nombre}?`,
      );

    if (!accepted) {
      return;
    }

    try {
      setError("");

      await deleteUsuario(
        usuario.id,
      );

      await loadUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }


  function openPasswordModal(
    usuario,
  ) {
    setPasswordModal(usuario);

    setNewPassword("");
  }


  function closePasswordModal() {
    if (saving) {
      return;
    }

    setPasswordModal(null);
    setNewPassword("");
  }


  async function handlePasswordSubmit(
    event,
  ) {
    event.preventDefault();

    if (!passwordModal) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateUsuarioPassword(
        passwordModal.id,
        newPassword,
      );

      closePasswordModal();

      window.alert(
        "Contraseña actualizada correctamente.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  return (
    <section className="users-page">

      <header className="users-header">
        <div>
          <p className="users-eyebrow">
            ADMINISTRACIÓN DEL SISTEMA
          </p>

          <h1>
            Usuarios
          </h1>

          <p>
            Administra cuentas, permisos,
            roles y acceso al sistema.
          </p>
        </div>


        <button
          type="button"
          className="users-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />

          Nuevo usuario
        </button>
      </header>


      <section className="users-stats">

        <article className="user-stat-card">
          <div className="user-stat-icon">
            <UsersRound size={22} />
          </div>

          <div>
            <span>
              Total usuarios
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>
        </article>


        <article className="user-stat-card">
          <div className="user-stat-icon">
            <UserCheck size={22} />
          </div>

          <div>
            <span>
              Activos
            </span>

            <strong>
              {stats.activos}
            </strong>
          </div>
        </article>


        <article className="user-stat-card">
          <div className="user-stat-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>
              Administradores
            </span>

            <strong>
              {stats.administradores}
            </strong>
          </div>
        </article>


        <article className="user-stat-card">
          <div className="user-stat-icon">
            <UserRound size={22} />
          </div>

          <div>
            <span>
              Maestros
            </span>

            <strong>
              {stats.maestros}
            </strong>
          </div>
        </article>


        <article className="user-stat-card">
          <div className="user-stat-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>
              Cuentas demo
            </span>

            <strong>
              {stats.demos}
            </strong>
          </div>
        </article>

      </section>


      <section className="users-panel">

        <div className="users-toolbar">

          <div className="users-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar por nombre o correo..."
            />
          </div>


          <div className="users-filters">

            <select
              value={rolFilter}
              onChange={(event) =>
                setRolFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                Todos los roles
              </option>

              <option value="administrador">
                Administradores
              </option>

              <option value="maestro">
                Maestros
              </option>
            </select>


            <select
              value={estadoFilter}
              onChange={(event) =>
                setEstadoFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                Todos los estados
              </option>

              <option value="true">
                Activos
              </option>

              <option value="false">
                Inactivos
              </option>
            </select>

          </div>

        </div>


        {error && (
          <div className="users-error">
            {error}
          </div>
        )}


        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Demo</th>
                <th>Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>


            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="users-empty"
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="users-empty"
                  >
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map(
                  (usuario) => (
                    <tr key={usuario.id}>

                      <td>
                        <div className="user-identity">

                          <div className="user-avatar">
                            {usuario.nombre
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {usuario.nombre}
                            </strong>

                            <span>
                              ID #{usuario.id}
                            </span>
                          </div>

                        </div>
                      </td>


                      <td>
                        <span className="user-email">
                          {usuario.correo}
                        </span>
                      </td>


                      <td>
                        <span
                          className={
                            `user-role user-role-${usuario.rol}`
                          }
                        >
                          {usuario.rol}
                        </span>
                      </td>


                      <td>
                        <span
                          className={
                            usuario.activo
                              ? "user-status user-status-active"
                              : "user-status user-status-inactive"
                          }
                        >
                          {usuario.activo
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>


                      <td>
                        {usuario.es_demo ? (
                          <span className="user-demo">
                            Demo
                          </span>
                        ) : (
                          <span className="user-no-demo">
                            —
                          </span>
                        )}
                      </td>


                      <td>
                        <span className="user-date">
                          {usuario.fecha_creacion
                            ? new Date(
                                usuario.fecha_creacion,
                              ).toLocaleDateString(
                                "es-MX",
                              )
                            : "—"}
                        </span>
                      </td>


                      <td>
                        <div className="user-actions">

                          <button
                            type="button"
                            title="Editar usuario"
                            onClick={() =>
                              openEditModal(
                                usuario,
                              )
                            }
                          >
                            <Pencil size={17} />
                          </button>


                          <button
                            type="button"
                            title="Cambiar contraseña"
                            onClick={() =>
                              openPasswordModal(
                                usuario,
                              )
                            }
                          >
                            <KeyRound size={17} />
                          </button>


                          <button
                            type="button"
                            title={
                              usuario.activo
                                ? "Desactivar usuario"
                                : "Activar usuario"
                            }
                            onClick={() =>
                              handleStatus(
                                usuario,
                              )
                            }
                          >
                            {usuario.activo ? (
                              <UserX size={17} />
                            ) : (
                              <UserCheck size={17} />
                            )}
                          </button>


                          <button
                            type="button"
                            className="user-delete-button"
                            title="Eliminar usuario"
                            onClick={() =>
                              handleDelete(
                                usuario,
                              )
                            }
                          >
                            <Trash2 size={17} />
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


      {/* MODAL CREAR / EDITAR */}

      {modalOpen && (
        <div className="user-modal-backdrop">

          <div className="user-modal">

            <header className="user-modal-header">

              <div>
                <span>
                  {editing
                    ? "EDITAR USUARIO"
                    : "NUEVO USUARIO"}
                </span>

                <h2>
                  {editing
                    ? "Modificar cuenta"
                    : "Crear nueva cuenta"}
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

              <div className="user-form">

                <label className="user-form-wide">
                  <span>
                    Nombre completo
                  </span>

                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre del usuario"
                    required
                    minLength="3"
                  />
                </label>


                <label className="user-form-wide">
                  <span>
                    Correo electrónico
                  </span>

                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="usuario@academico.com"
                    required
                  />
                </label>


                {!editing && (
                  <label className="user-form-wide">
                    <span>
                      Contraseña
                    </span>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      minLength="8"
                      required
                    />
                  </label>
                )}


                <label>
                  <span>
                    Rol
                  </span>

                  <select
                    name="rol"
                    value={form.rol}
                    onChange={handleChange}
                  >
                    <option value="maestro">
                      Maestro
                    </option>

                    <option value="administrador">
                      Administrador
                    </option>
                  </select>
                </label>


                <div className="user-form-options">

                  <label className="user-checkbox">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={form.activo}
                      onChange={handleChange}
                    />

                    <div>
                      <strong>
                        Usuario activo
                      </strong>

                      <span>
                        Puede iniciar sesión.
                      </span>
                    </div>
                  </label>


                  <label className="user-checkbox">
                    <input
                      type="checkbox"
                      name="es_demo"
                      checked={form.es_demo}
                      onChange={handleChange}
                    />

                    <div>
                      <strong>
                        Cuenta demo
                      </strong>

                      <span>
                        Identifica una cuenta de demostración.
                      </span>
                    </div>
                  </label>

                </div>

              </div>


              <footer className="user-modal-footer">

                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="users-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editing
                      ? "Guardar cambios"
                      : "Crear usuario"}
                </button>

              </footer>

            </form>

          </div>

        </div>
      )}


      {/* MODAL CONTRASEÑA */}

      {passwordModal && (
        <div className="user-modal-backdrop">

          <div className="user-password-modal">

            <header className="user-modal-header">

              <div>
                <span>
                  SEGURIDAD
                </span>

                <h2>
                  Cambiar contraseña
                </h2>
              </div>


              <button
                type="button"
                onClick={
                  closePasswordModal
                }
              >
                <X size={20} />
              </button>

            </header>


            <form
              onSubmit={
                handlePasswordSubmit
              }
            >

              <div className="user-password-content">

                <div className="user-password-person">
                  <div className="user-avatar">
                    {passwordModal.nombre
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {passwordModal.nombre}
                    </strong>

                    <span>
                      {passwordModal.correo}
                    </span>
                  </div>
                </div>


                <label>
                  <span>
                    Nueva contraseña
                  </span>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Mínimo 8 caracteres"
                    minLength="8"
                    required
                  />
                </label>

              </div>


              <footer className="user-modal-footer">

                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={
                    closePasswordModal
                  }
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="users-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Actualizando..."
                    : "Cambiar contraseña"}
                </button>

              </footer>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}


export default Usuarios;