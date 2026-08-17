import {
  Bell,
  LogOut,
  Menu,
  Palette,
  ShieldAlert,
  UserCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useTheme,
} from "../../context/ThemeContext";

import {
  getNotificacionesRiesgo,
} from "../../services/riesgoService";

import "./Navbar.css";


const READ_ALERTS_KEY =
  "academic-global-read-risk-alerts";


const themeNames = {
  light: "Claro",
  dark: "Oscuro",
  ocean: "Azul Nocturno",
  aurora: "Aurora",
};


function getAlertSignature(
  item,
) {
  return [
    item.id,
    item.promedio_actual ??
      "sin-promedio",
    item.materias_pendientes ??
      "sin-pendientes",
  ].join("|");
}


function readStoredAlerts() {
  try {
    const stored =
      localStorage.getItem(
        READ_ALERTS_KEY,
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}


function saveStoredAlerts(
  alerts,
) {
  localStorage.setItem(
    READ_ALERTS_KEY,
    JSON.stringify(
      alerts,
    ),
  );
}


function Navbar({
  onToggleSidebar,
  sidebarCollapsed,
}) {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const {
    theme,
    cycleTheme,
  } = useTheme();


  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);


  const [
    notifications,
    setNotifications,
  ] = useState({
    cantidad: 0,
    notificaciones: [],
  });


  const [
    readAlerts,
    setReadAlerts,
  ] = useState(
    () =>
      readStoredAlerts(),
  );


  async function loadNotifications() {
    try {
      const data =
        await getNotificacionesRiesgo();

      const items =
        data.notificaciones ||
        [];

      const activeSignatures =
        new Set(
          items.map(
            (item) =>
              getAlertSignature(
                item,
              ),
          ),
        );

      const stored =
        readStoredAlerts();

      /*
       * Sólo conservamos como leídas
       * las alertas que todavía existen.
       *
       * Si el alumno mejora y desaparece
       * del riesgo, también eliminamos
       * su alerta guardada.
       *
       * Si después vuelve a bajar,
       * se vuelve a considerar nueva.
       */
      const cleaned =
        stored.filter(
          (signature) =>
            activeSignatures.has(
              signature,
            ),
        );

      saveStoredAlerts(
        cleaned,
      );

      setReadAlerts(
        cleaned,
      );

      setNotifications(
        data,
      );
    } catch {
      setNotifications({
        cantidad: 0,
        notificaciones: [],
      });
    }
  }


  useEffect(() => {
    loadNotifications();

    const interval =
      setInterval(
        loadNotifications,
        30000,
      );

    function handleRiskUpdate() {
      loadNotifications();
    }

    window.addEventListener(
      "academic-risk-updated",
      handleRiskUpdate,
    );

    return () => {
      clearInterval(
        interval,
      );

      window.removeEventListener(
        "academic-risk-updated",
        handleRiskUpdate,
      );
    };
  }, []);


  const unreadNotifications =
    useMemo(
      () =>
        notifications
          .notificaciones
          .filter(
            (item) =>
              !readAlerts.includes(
                getAlertSignature(
                  item,
                ),
              ),
          ),
      [
        notifications,
        readAlerts,
      ],
    );


  const unreadCount =
    unreadNotifications.length;


  function markAsRead(
    item,
  ) {
    const signature =
      getAlertSignature(
        item,
      );

    if (
      readAlerts.includes(
        signature,
      )
    ) {
      return;
    }

    const next = [
      ...readAlerts,
      signature,
    ];

    setReadAlerts(
      next,
    );

    saveStoredAlerts(
      next,
    );
  }


  function handleLogout() {
    logout();

    navigate("/");
  }


  function openRiskStudent(
    alumno,
  ) {
    markAsRead(
      alumno,
    );

    setNotificationsOpen(
      false,
    );

    navigate(
      `/riesgo?alumno_id=${alumno.id}`,
    );
  }


  function openRiskPage() {
    setNotificationsOpen(
      false,
    );

    navigate(
      "/riesgo",
    );
  }


  return (
    <header className="navbar">

      <div className="navbar-left">

        <button
          type="button"
          className="navbar-menu-button"
          onClick={
            onToggleSidebar
          }
          title={
            sidebarCollapsed
              ? "Mostrar menú"
              : "Ocultar menú"
          }
        >
          <Menu size={21} />
        </button>


        <span className="navbar-title">
          Sistema Académico Global
        </span>

      </div>


      <div className="navbar-actions">

        <button
          type="button"
          className="navbar-icon"
          title={
            `Tema actual: ${
              themeNames[theme] ||
              theme
            }`
          }
          onClick={
            cycleTheme
          }
        >
          <Palette
            size={19}
          />
        </button>


        <div className="navbar-notification-wrapper">

          <button
            type="button"
            className={
              unreadCount > 0
                ? "navbar-icon navbar-bell-button navbar-bell-alert"
                : "navbar-icon navbar-bell-button"
            }
            title={
              unreadCount > 0
                ? `${unreadCount} alerta${unreadCount === 1 ? "" : "s"} académica${unreadCount === 1 ? "" : "s"} nueva${unreadCount === 1 ? "" : "s"}`
                : "Sin alertas nuevas"
            }
            onClick={() =>
              setNotificationsOpen(
                (current) =>
                  !current,
              )
            }
          >
            <Bell
              size={19}
            />

            {unreadCount > 0 && (
              <span className="navbar-notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>


          {notificationsOpen && (
            <div className="navbar-notification-panel">

              <header className="navbar-notification-header">

                <div>
                  <span>
                    ALERTAS ACADÉMICAS
                  </span>

                  <strong>
                    Riesgo académico
                  </strong>
                </div>

                <div className="navbar-notification-count">
                  {unreadCount}
                </div>

              </header>


              <div className="navbar-notification-list">

                {notifications
                  .notificaciones
                  .length === 0 ? (
                  <div className="navbar-notification-empty">

                    <ShieldAlert
                      size={24}
                    />

                    <span>
                      No hay alumnos
                      en riesgo.
                    </span>

                  </div>
                ) : (
                  notifications
                    .notificaciones
                    .map(
                      (item) => {
                        const signature =
                          getAlertSignature(
                            item,
                          );

                        const unread =
                          !readAlerts.includes(
                            signature,
                          );

                        const danger =
                          Number(
                            item.promedio_actual,
                          ) < 6.6;

                        return (
                          <button
                            key={
                              signature
                            }
                            type="button"
                            className={
                              unread
                                ? "navbar-notification-item navbar-notification-item-unread"
                                : "navbar-notification-item"
                            }
                            onClick={() =>
                              openRiskStudent(
                                item,
                              )
                            }
                          >

                            <div
                              className={
                                danger
                                  ? "navbar-risk-icon navbar-risk-icon-danger"
                                  : "navbar-risk-icon"
                              }
                            >
                              <ShieldAlert
                                size={17}
                              />
                            </div>


                            <div className="navbar-notification-info">

                              <strong>
                                {item.nombre}
                              </strong>

                              <span>
                                Carrera: {
                                  item.carrera_clave
                                }
                              </span>

                              <span>
                                Semestre {
                                  item.semestre
                                }
                              </span>

                              <span>
                                Promedio actual: {
                                  item.promedio_actual
                                }
                              </span>

                            </div>


                            <span
                              className={
                                danger
                                  ? "navbar-risk-level navbar-risk-high"
                                  : "navbar-risk-level navbar-risk-medium"
                              }
                            >
                              {danger
                                ? "Crítico"
                                : "Atención"}
                            </span>

                          </button>
                        );
                      },
                    )
                )}

              </div>


              {notifications
                .notificaciones
                .length > 0 && (
                <button
                  type="button"
                  className="navbar-notification-footer"
                  onClick={
                    openRiskPage
                  }
                >
                  Ver todos los alumnos
                  en riesgo
                </button>
              )}

            </div>
          )}

        </div>


        <div className="navbar-user">

          <UserCircle
            size={34}
          />

          <div>
            <strong>
              {user?.nombre ||
                "Usuario"}
            </strong>

            <span>
              {user?.rol ||
                ""}
            </span>
          </div>

        </div>


        <button
          type="button"
          className="navbar-icon"
          title="Cerrar sesión"
          onClick={
            handleLogout
          }
        >
          <LogOut
            size={19}
          />
        </button>

      </div>

    </header>
  );
}


export default Navbar;