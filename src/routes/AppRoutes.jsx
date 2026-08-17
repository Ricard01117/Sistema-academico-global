import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Alumnos from "../pages/Alumnos/Alumnos";
import Analisis from "../pages/Analisis/Analisis";
import Calificaciones from "../pages/Calificaciones/Calificaciones";
import Carreras from "../pages/Carreras/Carreras";
import Configuracion from "../pages/Configuracion/Configuracion";
import Dashboard from "../pages/Dashboard/Dashboard";
import Grupos from "../pages/Grupos/Grupos";
import Login from "../pages/Login/Login";
import Materias from "../pages/Materias/Materias";
import Riesgo from "../pages/Riesgo/Riesgo";
import Usuarios from "../pages/Usuarios/Usuarios";


function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
}


function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />


      <Route
        element={
          <ProtectedLayout />
        }
      >

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/alumnos"
          element={<Alumnos />}
        />

        <Route
          path="/carreras"
          element={<Carreras />}
        />

        <Route
          path="/materias"
          element={<Materias />}
        />

        <Route
          path="/grupos"
          element={<Grupos />}
        />

        <Route
          path="/calificaciones"
          element={
            <Calificaciones />
          }
        />

        <Route
          path="/analisis"
          element={<Analisis />}
        />

        <Route
          path="/riesgo"
          element={<Riesgo />}
        />

        <Route
          path="/usuarios"
          element={<Usuarios />}
        />

        <Route
          path="/configuracion"
          element={
            <Configuracion />
          }
        />

      </Route>


      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


export default AppRoutes;