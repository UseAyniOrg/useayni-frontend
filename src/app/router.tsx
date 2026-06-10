import { createBrowserRouter } from "react-router-dom";
import Main from "../main.tsx";
import Credentials from "../pages/credencials/credencials.tsx";
import Home from "../pages/home/home.tsx";
import { ProtectedRoute } from "../components/ProtectedRoute.tsx";
import MemberProfile from "@/pages/member-profile/member-profile.tsx";
import MiscellaneousDetail from "@/pages/miscellaneous/miscellaneous-detail.tsx";
import InviteCenter from "@/pages/invites/invite-center.tsx";

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
    path: "/miscelaneas/:id",
    element: (
      <ProtectedRoute>
        <MiscellaneousDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/convites",
    element: (
      <ProtectedRoute>
        <InviteCenter />
      </ProtectedRoute>
    ),
  },
]);
