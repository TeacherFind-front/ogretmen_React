import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import TutorLayout from "./layouts/TutorLayout";
import AdminLayout from "./layouts/AdminLayout";

// Home & Public
import Home from "./pages/public/Home";
import TutorsList from "./pages/public/TutorsList";
import TutorDetail from "./pages/public/TutorDetail";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ForgotPassword from "./pages/public/ForgotPassword";
import CreateAd from "./pages/public/CreateAd";

// Dashboards
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentLessons from "./pages/student/StudentLessons";
import StudentMessages from "./pages/student/StudentMessages";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import TutorAvailability from "./pages/tutor/TutorAvailability";
import AdminDashboard from "./pages/admin/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "tutors", element: <TutorsList /> },
      { path: "tutors/:slug", element: <TutorDetail /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "create-ad", element: <CreateAd /> },
    ],
  },
  {
    path: "/app",
    element: <StudentLayout />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "lessons", element: <StudentLessons /> },
      { path: "messages", element: <StudentMessages /> },
    ],
  },
  {
    path: "/tutor",
    element: <TutorLayout />,
    children: [
      { index: true, element: <Navigate to="/tutor/dashboard" replace /> },
      { path: "dashboard", element: <TutorDashboard /> },
      { path: "availability", element: <TutorAvailability /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
