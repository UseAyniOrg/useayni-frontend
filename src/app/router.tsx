import { createBrowserRouter } from "react-router-dom";
import Main from "../main.tsx";
import Credentials from "../pages/credencials/credencials.tsx";
import Home from "../pages/home/home.tsx";
import { ProtectedRoute } from "../components/ProtectedRoute.tsx";
import MemberProfile from "@/pages/member-profile/member-profile.tsx";
import CreateMiscellaneous from "@/pages/miscellaneous/create-miscellaneous.tsx";
import ListMiscellaneous from "@/pages/miscellaneous/list-miscellaneous.tsx";

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
        <ListMiscellaneous />
      </ProtectedRoute>
    ),
  },
  {
    path: "/miscelaneas/nova",
    element: (
      <ProtectedRoute>
        <CreateMiscellaneous />
      </ProtectedRoute>
    ),
  },
]);
