import { createBrowserRouter } from "react-router-dom";
import Main from "../main.tsx";
import Credentials from "../pages/credencials/credencials.tsx";
import Home from "../pages/home/home.tsx";
import { ProtectedRoute } from "../components/ProtectedRoute.tsx";
import MemberProfile from "@/pages/member-profile/member-profile.tsx";
import MiscellaneousListPage from "@/pages/miscellaneous/list.tsx";
import MiscellaneousCreatePage from "@/pages/miscellaneous/create.tsx";
import MiscellaneousDetailPage from "@/pages/miscellaneous/detail.tsx";
import MiscellaneousEditPage from "@/pages/miscellaneous/edit.tsx";
import MiscellaneousFormBuilderPage from "@/pages/miscellaneous/form-builder.tsx";
import ApprovalsPage from "@/pages/approvals/list.tsx";
import MembersManagementPage from "@/pages/members/management.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/login",
    element: <Credentials />,
  },
  {
    path: "/cadastro",
    element: <Credentials />,
  },
  {
    path: "/recuperar-senha",
    element: <Credentials />
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/membros/:memberSlugName",
    element: (
      <ProtectedRoute>
        <MemberProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas",
    element: (
      <ProtectedRoute>
        <MiscellaneousListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/nova",
    element: (
      <ProtectedRoute>
        <MiscellaneousCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/:id",
    element: (
      <ProtectedRoute>
        <MiscellaneousDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/:id/editar",
    element: (
      <ProtectedRoute>
        <MiscellaneousEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/:id/formulario",
    element: (
      <ProtectedRoute>
        <MiscellaneousFormBuilderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/aprovacoes",
    element: (
      <ProtectedRoute>
        <ApprovalsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gestao-membros",
    element: (
      <ProtectedRoute>
        <MembersManagementPage />
      </ProtectedRoute>
    ),
  },
]);
