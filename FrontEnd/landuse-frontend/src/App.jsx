import { Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import MyPermits from "./pages/MyPermits.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import PermitNew from "./pages/PermitNew.jsx";
import PermitUpload from "./pages/PermitUpload.jsx";
import AdminPermitView from "./pages/AdminPermitView.jsx";

export default function App() {
  const { me } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginRegister />} />

      {/* USER */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/permits"
        element={
          <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN"]}>
            <MyPermits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/permits/new"
        element={
          <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN"]}>
            <PermitNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/permits/:id/upload"
        element={
          <ProtectedRoute allow={["ROLE_USER", "ROLE_ADMIN"]}>
            <PermitUpload />
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={["ROLE_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allow={["ROLE_ADMIN"]}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/permits/:id"
        element={
          <ProtectedRoute allow={["ROLE_ADMIN"]}>
            <AdminPermitView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={me ? (me.role === "ROLE_ADMIN" ? "/admin" : "/user") : "/login"} />}
      />
      <Route path="*" element={<div style={{ padding: 24, color: "#fff" }}>Not Found</div>} />
    </Routes>
  );
}