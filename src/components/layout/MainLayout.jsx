import {
  useEffect,
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import "./MainLayout.css";


const SIDEBAR_KEY =
  "academic-global-sidebar-collapsed";


function MainLayout() {
  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(() => {
    return (
      localStorage.getItem(
        SIDEBAR_KEY,
      ) === "true"
    );
  });


  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_KEY,
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);


  function toggleSidebar() {
    setSidebarCollapsed(
      (current) => !current,
    );
  }


  return (
    <div className="main-layout">
      <Sidebar
        collapsed={
          sidebarCollapsed
        }
      />

      <div className="main-layout-content">
        <Navbar
          sidebarCollapsed={
            sidebarCollapsed
          }
          onToggleSidebar={
            toggleSidebar
          }
        />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


export default MainLayout;