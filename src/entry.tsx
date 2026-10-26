import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./style.css";
import { router } from "./app/router";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";

const el = document.getElementById("app");
if (!el) throw new Error("Root element #app not found");

createRoot(el).render(
  <React.StrictMode>
    <TenantProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </TenantProvider>
  </React.StrictMode>
);
