import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import TutorLayout from "./layouts/TutorLayout";
import AdminLayout from "./layouts/AdminLayout";

// Home & Public
import Home from "./pages/public/Home";
import TutorsList from "./pages/public/TutorsList";
import TutorDetail from "./pages/public/TutorDetail";
import Login from "./pages/public/login";
import Register from "./pages/public/Register";
import VerifyEmail from "./pages/public/VerifyEmail";
import ForgotPassword from "./pages/public/ForgotPassword";
import FAQ from "./pages/public/FAQ";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

// Dashboards
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentLessons from "./pages/student/StudentLessons";
import StudentMessages from "./pages/student/StudentMessages";
import StudentProfile from "./pages/student/StudentProfile";
import StudentSecurity from "./pages/student/StudentSecurity";
import NewBooking from "./pages/student/NewBooking";
import StudentReview from "./pages/student/StudentReview";
import StudentFavorites from "./pages/student/StudentFavorites";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import TutorAvailability from "./pages/tutor/TutorAvailability";
import TutorProfile from "./pages/tutor/TutorProfile";
import TutorSocialMedia from "./pages/tutor/TutorSocialMedia";
import TutorLessons from "./pages/tutor/TutorLessons";
import TutorMessages from "./pages/tutor/TutorMessages";
import TutorChangePassword from "./pages/tutor/TutorChangePassword";
import CreateListing from "./pages/tutor/CreateListing";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTutors from "./pages/admin/AdminTutors";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMessages from "./pages/admin/AdminMessages";
import ProtectedRoute from "./components/shared/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "tutors", element: <TutorsList /> },
      { path: "tutors/:id", element: <TutorDetail /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "sss", element: <FAQ /> },
      { path: "hakkimizda", element: <About /> },
      { path: "iletisim", element: <Contact /> },
    ],
  },
  {
    path: "/student",
    element: (
      <ProtectedRoute allowedRoles={["1", "student", "2", "tutor", "3", "admin", "4", "superadmin"]}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/student/dashboard" replace /> },
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "lessons", element: <StudentLessons /> },
      { path: "messages", element: <StudentMessages /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "security", element: <StudentSecurity /> },
      { path: "bookings/new", element: <NewBooking /> },
      { path: "review/:bookingId", element: <StudentReview /> },
      { path: "favorites", element: <StudentFavorites /> },
    ],
  },
  {
    path: "/tutor",
    element: (
      <ProtectedRoute allowedRoles={["2", "tutor"]}>
        <TutorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/tutor/dashboard" replace /> },
      { path: "dashboard", element: <TutorDashboard /> },
      { path: "availability", element: <TutorAvailability /> },
      { path: "profile", element: <TutorProfile /> },
      { path: "social-media", element: <TutorSocialMedia /> },
      { path: "lessons", element: <TutorLessons /> },
      { path: "messages", element: <TutorMessages /> },
      { path: "create-listing", element: <CreateListing /> },
      { path: "change-password", element: <TutorChangePassword /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["3", "admin", "4", "superadmin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "tutors", element: <AdminTutors /> },
      { path: "messages", element: <AdminMessages /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
]);

import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}
// Force refresh
