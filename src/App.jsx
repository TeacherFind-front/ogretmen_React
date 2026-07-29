import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import TutorLayout from "./layouts/TutorLayout";
import AdminLayout from "./layouts/AdminLayout";

// Kamua Açık (Public) Sayfalar
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
import Pricing from "./pages/public/Pricing";
import TermsOfUse from "./pages/public/legal/TermsOfUse";
import PrivacyPolicy from "./pages/public/legal/PrivacyPolicy";
import DistanceSelling from "./pages/public/legal/DistanceSelling";

// Öğrenci (Student) Sayfaları
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentLessons from "./pages/student/StudentLessons";
import StudentMessages from "./pages/student/StudentMessages";
import StudentProfile from "./pages/student/StudentProfile";
import StudentSecurity from "./pages/student/StudentSecurity";
import NewBooking from "./pages/student/NewBooking";
import StudentReview from "./pages/student/StudentReview";
import StudentFavorites from "./pages/student/StudentFavorites";

// Eğitmen (Tutor) Sayfaları
import TutorDashboard from "./pages/tutor/TutorDashboard";
import TutorAvailability from "./pages/tutor/TutorAvailability";
import TutorProfile from "./pages/tutor/TutorProfile";
import TutorSocialMedia from "./pages/tutor/TutorSocialMedia";
import TutorLessons from "./pages/tutor/TutorLessons";
import TutorMessages from "./pages/tutor/TutorMessages";
import TutorChangePassword from "./pages/tutor/TutorChangePassword";
import CreateListing from "./pages/tutor/CreateListing";
import TutorBookings from "./pages/tutor/TutorBookings";
import TutorListings from "./pages/tutor/TutorListings";
import EditListing from "./pages/tutor/EditListing";
import TutorDopings from "./pages/tutor/TutorDopings";

// Yönetici (Admin) Sayfaları
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTutors from "./pages/admin/AdminTutors";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMessages from "./pages/admin/AdminMessages";

// Paylaşılan ve Korumalı Rotalar için Yardımcılar
import ProtectedRoute from "./components/shared/ProtectedRoute";
import SupportMessages from "./pages/shared/SupportMessages";

/**
 * router - Uygulamanın tüm sayfa yönlendirmelerini (Routing) tanımlayan nesne.
 * Yollar (Paths) rol tabanlı olarak gruplandırılmıştır:
 * - "/" : Herkese açık sayfalar (PublicLayout altında)
 * - "/student" : Sadece yetkilendirilmiş öğrencilerin görebileceği sayfalar (StudentLayout altında, ProtectedRoute korumalı)
 * - "/tutor" : Sadece yetkilendirilmiş eğitmenlerin görebileceği sayfalar (TutorLayout altında, ProtectedRoute korumalı)
 * - "/admin" : Sadece yöneticilerin erişebileceği sayfalar (AdminLayout altında, ProtectedRoute korumalı)
 */
const router = createBrowserRouter([
  {
    // Herkese Açık Yollar
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> }, // Ana sayfa
      { path: "tutors", element: <TutorsList /> }, // Eğitmen arama listesi
      { path: "tutors/:id", element: <TutorDetail /> }, // Eğitmen detay sayfası
      { path: "login", element: <Login /> }, // Giriş yap
      { path: "register", element: <Register /> }, // Üye ol
      { path: "verify-email", element: <VerifyEmail /> }, // E-posta doğrulama
      { path: "forgot-password", element: <ForgotPassword /> }, // Şifremi unuttum
      { path: "sss", element: <FAQ /> }, // Sıkça sorulan sorular
      { path: "hakkimizda", element: <About /> }, // Hakkımızda
      { path: "iletisim", element: <Contact /> }, // İletişim
      { path: "pricing", element: <Pricing /> }, // Ücretlendirme
      { path: "kullanim-sartlari", element: <TermsOfUse /> }, // Kullanım Şartları
      { path: "gizlilik-politikasi", element: <PrivacyPolicy /> }, // Gizlilik Politikası
      { path: "mesafeli-satis-sozlesmesi", element: <DistanceSelling /> }, // Mesafeli Satış Sözleşmesi
      { path: "bookings/new", element: <NewBooking /> }, // Yeni ders rezervasyonu oluşturma (Öğrenci menüsü dışında)
    ],
  },
  {
    // Öğrenci Paneli Yolları
    path: "/student",
    element: (
      // ProtectedRoute: Öğrenci, Eğitmen veya Admin rollerinden herhangi birine sahip olmayı şart koşar
      <ProtectedRoute allowedRoles={["1", "student", "2", "tutor", "3", "admin", "4", "superadmin"]}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/student/dashboard" replace /> }, // Doğrudan panele yönlendir
      { path: "dashboard", element: <StudentDashboard /> }, // Öğrenci kontrol paneli
      { path: "lessons", element: <StudentLessons /> }, // Öğrencinin aldığı dersler
      { path: "messages", element: <StudentMessages /> }, // Mesajlaşma kutusu
      { path: "profile", element: <StudentProfile /> }, // Profil ayarları
      { path: "security", element: <StudentSecurity /> }, // Şifre değiştirme vb. güvenlik ayarları
      { path: "review/:bookingId", element: <StudentReview /> }, // Rezervasyona/derse yorum yazma
      { path: "favorites", element: <StudentFavorites /> }, // Favori eğitmenler listesi
      { path: "support", element: <SupportMessages /> }, // Destek mesajları
    ],
  },
  {
    // Eğitmen Paneli Yolları
    path: "/tutor",
    element: (
      // Sadece "2" veya "tutor" rolüne sahip eğitmenler erişebilir
      <ProtectedRoute allowedRoles={["2", "tutor"]}>
        <TutorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/tutor/dashboard" replace /> }, // Doğrudan panele yönlendir
      { path: "dashboard", element: <TutorDashboard /> }, // Eğitmen kontrol paneli
      { path: "availability", element: <TutorAvailability /> }, // Çalışma saatleri/takvim ayarları
      { path: "profile", element: <TutorProfile /> }, // Profil ve sertifika yönetimi
      { path: "social-media", element: <TutorSocialMedia /> }, // Sosyal medya linkleri ayarları
      { path: "lessons", element: <TutorLessons /> }, // Eğitmenin verdiği dersler
      { path: "bookings", element: <TutorBookings /> }, // Eğitmene gelen ders talepleri
      { path: "messages", element: <TutorMessages /> }, // Canlı sohbet paneli
      { path: "create-listing", element: <CreateListing /> }, // Yeni ders ilanı oluşturma
      { path: "listings", element: <TutorListings /> }, // İlanlarım listesi
      { path: "listings/:id/edit", element: <EditListing /> }, // İlan düzenleme
      { path: "dopings", element: <TutorDopings /> }, // Doping paketleri ve öne çıkarma
      { path: "change-password", element: <TutorChangePassword /> }, // Şifre değiştirme
      { path: "support", element: <SupportMessages /> }, // Destek mesajları
    ],
  },
  {
    // Yönetici Paneli Yolları
    path: "/admin",
    element: (
      // Sadece "3" (admin) veya "4" (superadmin) rolündeki yöneticiler erişebilir
      <ProtectedRoute allowedRoles={["3", "admin", "4", "superadmin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> }, // Doğrudan panele yönlendir
      { path: "dashboard", element: <AdminDashboard /> }, // Yönetici kontrol paneli
      { path: "users", element: <AdminUsers /> }, // Kullanıcı yönetimi
      { path: "tutors", element: <AdminTutors /> }, // Eğitmen başvuruları/yönetimi
      { path: "messages", element: <AdminMessages /> }, // Sistem mesajları yönetimi
      { path: "settings", element: <AdminSettings /> }, // Sistem genel ayarları
    ],
  },
]);

import { Toaster } from "react-hot-toast";

/**
 * App - Uygulamanın en kök (Root) bileşenidir.
 * Toast bildirimlerini (Toaster) ve yukarıda tanımlanan Router'ı (RouterProvider) sarmalayarak çalıştırır.
 */
export default function App() {
  return (
    <>
      {/* Sistem genelinde pop-up bildirimler göstermeye yarayan kütüphane bileşeni */}
      <Toaster position="top-center" />
      {/* Rota sağlayıcısı */}
      <RouterProvider router={router} />
    </>
  );
}
// Force refresh

