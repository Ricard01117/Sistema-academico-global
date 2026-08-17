import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function useDemoAccount() {
    setCorreo("profesor@academico.com");
    setPassword("Profesor123!");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(correo, password);

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background auth-background-one" />
      <div className="auth-background auth-background-two" />

      <section className="auth-container">
        <aside className="auth-information">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <GraduationCap size={27} />
            </div>

            <div>
              <strong>Academic Global</strong>
              <span>Sistema académico universitario</span>
            </div>
          </div>

          <div className="auth-information-content">
            <span className="auth-label">
              PLATAFORMA ACADÉMICA
            </span>

            <h1>
              Gestión académica
              <span> en un solo lugar.</span>
            </h1>

            <p>
              Administra alumnos, materias,
              calificaciones y analiza el rendimiento
              académico desde una plataforma moderna.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <div>
                  <UsersRound size={19} />
                </div>

                <span>
                  Gestión centralizada de alumnos y grupos
                </span>
              </div>

              <div className="auth-feature">
                <div>
                  <BookOpen size={19} />
                </div>

                <span>
                  Materias y calificaciones organizadas
                </span>
              </div>

              <div className="auth-feature">
                <div>
                  <BarChart3 size={19} />
                </div>

                <span>
                  Análisis y estadísticas académicas
                </span>
              </div>

              <div className="auth-feature">
                <div>
                  <ShieldCheck size={19} />
                </div>

                <span>
                  Acceso protegido y control de usuarios
                </span>
              </div>
            </div>
          </div>

          <div className="auth-information-footer">
            <ShieldCheck size={16} />

            <span>
              Autenticación segura mediante FastAPI y JWT
            </span>
          </div>
        </aside>

        <section className="auth-form-section">
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-mobile-brand">
              <GraduationCap size={26} />

              <strong>Academic Global</strong>
            </div>

            <div className="auth-form-header">
              <span className="auth-form-tag">
                PORTAL DE ACCESO
              </span>

              <h2>Bienvenido</h2>

              <p>
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>{error}</span>
              </div>
            )}

            <div className="auth-fields">
              <label className="auth-field">
                <span>Correo electrónico</span>

                <div className="auth-input-wrapper">
                  <Mail size={18} />

                  <input
                    type="email"
                    value={correo}
                    onChange={(event) =>
                      setCorreo(event.target.value)
                    }
                    placeholder="correo@universidad.edu.mx"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="auth-field">
                <span>Contraseña</span>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    title={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>
            </div>

            <div className="auth-options">
              <label className="auth-remember">
                <input type="checkbox" />

                <span>Recordar sesión</span>
              </label>

              <button
                type="button"
                className="auth-link-button"
              >
                Recuperar contraseña
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Verificando..."
                  : "Ingresar al sistema"}
              </span>

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

            <div className="auth-separator">
              <span />
              <p>Cuenta de demostración</p>
              <span />
            </div>

            <div className="demo-card">
              <div className="demo-card-header">
                <div className="demo-avatar">
                  <GraduationCap size={19} />
                </div>

                <div>
                  <strong>Profesor Demo</strong>
                  <span>Acceso de demostración</span>
                </div>

                <div className="demo-status">
                  <Check size={14} />
                  Activa
                </div>
              </div>

              <div className="demo-credentials">
                <div>
                  <span>Correo</span>
                  <strong>
                    profesor@academico.com
                  </strong>
                </div>

                <div>
                  <span>Contraseña</span>
                  <strong>Profesor123!</strong>
                </div>
              </div>

              <button
                type="button"
                className="demo-use-button"
                onClick={useDemoAccount}
              >
                Utilizar credenciales
              </button>
            </div>

            <p className="auth-footer-text">
              Sistema Académico Global
              <span> · </span>
              Acceso restringido
            </p>
          </form>
        </section>
      </section>
    </main>
  );
}

export default Login;