import {
  BarChart3,
  BookOpen,
  FileText,
  Gauge,
  GraduationCap,
  Settings,
  ShieldAlert,
  University,
  Users,
  UsersRound,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import "./Sidebar.css";


const menuItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: Gauge,
  },
  {
    path: "/alumnos",
    label: "Alumnos",
    icon: GraduationCap,
  },
  {
    path: "/carreras",
    label: "Carreras",
    icon: University,
  },
  {
    path: "/materias",
    label: "Materias",
    icon: BookOpen,
  },
  {
    path: "/grupos",
    label: "Grupos",
    icon: UsersRound,
  },
  {
    path: "/calificaciones",
    label: "Calificaciones",
    icon: FileText,
  },
  {
    path: "/analisis",
    label: "Análisis",
    icon: BarChart3,
  },
  {
    path: "/riesgo",
    label: "Riesgo",
    icon: ShieldAlert,
  },
  {
    path: "/usuarios",
    label: "Usuarios",
    icon: Users,
  },
  {
    path: "/configuracion",
    label: "Configuración",
    icon: Settings,
  },
];


function Sidebar({
  collapsed,
}) {
  return (
    <aside
      className={
        collapsed
          ? "sidebar sidebar-collapsed"
          : "sidebar"
      }
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <GraduationCap size={25} />
        </div>

        {!collapsed && (
          <div className="sidebar-brand-text">
            <strong>
              Academic Global
            </strong>

            <span>
              Sistema Académico
            </span>
          </div>
        )}
      </div>


      <div className="sidebar-divider" />


      <nav className="sidebar-navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={
                collapsed
                  ? item.label
                  : undefined
              }
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link sidebar-link-active"
                  : "sidebar-link"
              }
            >
              <Icon
                className="sidebar-link-icon"
                size={21}
              />

              {!collapsed && (
                <span>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}


export default Sidebar;