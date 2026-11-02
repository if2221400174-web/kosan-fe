import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Login from "./pages/auth/login"
import Register from "./pages/auth/register"
import LandingPage from "./pages/public"
import EditProfile from "./components/EditProfile"
import RuangChat from "./components/RuangChat"

// ===== ADMIN (administrator & admin) =====
import AdminLayout from "./layouts/admin"
import Dashboard from "./pages/admin"
import AdminUser from "./pages/admin/users"
import CreateUser from "./pages/admin/users/create"
import EditUser from "./pages/admin/users/edit"
import AdminKamar from "./pages/admin/kamar"
import CreateKamar from "./pages/admin/kamar/create"
import EditKamar from "./pages/admin/kamar/edit"
import AdminFasilitas from "./pages/admin/fasilitas"
import CreateFasilitas from "./pages/admin/fasilitas/create"
import EditFasilitas from "./pages/admin/fasilitas/edit"
import AdminGaleri from "./pages/admin/galeri"
import CreateGaleri from "./pages/admin/galeri/create"
import AdminPenyewa from "./pages/admin/penyewa"
import CreatePenyewa from "./pages/admin/penyewa/create"
import EditPenyewa from "./pages/admin/penyewa/edit"
import AdminKontrakSewa from "./pages/admin/kontrak_sewa"
import CreateKontrakSewa from "./pages/admin/kontrak_sewa/create"
import EditKontrakSewa from "./pages/admin/kontrak_sewa/edit"
import AdminTagihan from "./pages/admin/tagihan"
import CreateTagihan from "./pages/admin/tagihan/create"
import EditTagihan from "./pages/admin/tagihan/edit"
import AdminPembayaran from "./pages/admin/pembayaran"
import AdminPengeluaran from "./pages/admin/pengeluaran"
import CreatePengeluaran from "./pages/admin/pengeluaran/create"
import EditPengeluaran from "./pages/admin/pengeluaran/edit"
import AdminLaporan from "./pages/admin/laporan"
import AdminPengumuman from "./pages/admin/pengumuman"
import CreatePengumuman from "./pages/admin/pengumuman/create"
import EditPengumuman from "./pages/admin/pengumuman/edit"
import AdminProfilKos from "./pages/admin/profil_kos"

// ===== PENYEWA =====
import PenyewaLayout from "./layouts/penyewa"
import DashboardPenyewa from "./pages/penyewa"
import PenyewaKontrak from "./pages/penyewa/kontrak_sewa"
import PenyewaTagihan from "./pages/penyewa/tagihan"
import PenyewaPembayaran from "./pages/penyewa/pembayaran"
import CreatePembayaranPenyewa from "./pages/penyewa/pembayaran/create"
import PenyewaLaporan from "./pages/penyewa/laporan"
import CreateLaporanPenyewa from "./pages/penyewa/laporan/create"
import PenyewaPengumuman from "./pages/penyewa/pengumuman"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* admin: administrator (pemilik) & admin (pekerja kos) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          {/* khusus administrator (dicek juga di halaman & backend) */}
          <Route path="users">
            <Route index element={<AdminUser />} />
            <Route path="create" element={<CreateUser />} />
            <Route path="edit/:id" element={<EditUser />} />
          </Route>
          <Route path="profil-kos" element={<AdminProfilKos />} />

          <Route path="kamar">
            <Route index element={<AdminKamar />} />
            <Route path="create" element={<CreateKamar />} />
            <Route path="edit/:id" element={<EditKamar />} />
          </Route>

          <Route path="fasilitas">
            <Route index element={<AdminFasilitas />} />
            <Route path="create" element={<CreateFasilitas />} />
            <Route path="edit/:id" element={<EditFasilitas />} />
          </Route>

          <Route path="galeri">
            <Route index element={<AdminGaleri />} />
            <Route path="create" element={<CreateGaleri />} />
          </Route>

          <Route path="penyewa">
            <Route index element={<AdminPenyewa />} />
            <Route path="create" element={<CreatePenyewa />} />
            <Route path="edit/:id" element={<EditPenyewa />} />
          </Route>

          <Route path="kontrak-sewa">
            <Route index element={<AdminKontrakSewa />} />
            <Route path="create" element={<CreateKontrakSewa />} />
            <Route path="edit/:id" element={<EditKontrakSewa />} />
          </Route>

          <Route path="tagihan">
            <Route index element={<AdminTagihan />} />
            <Route path="create" element={<CreateTagihan />} />
            <Route path="edit/:id" element={<EditTagihan />} />
          </Route>

          <Route path="pembayaran" element={<AdminPembayaran />} />

          <Route path="pengeluaran">
            <Route index element={<AdminPengeluaran />} />
            <Route path="create" element={<CreatePengeluaran />} />
            <Route path="edit/:id" element={<EditPengeluaran />} />
          </Route>

          <Route path="laporan" element={<AdminLaporan />} />
          <Route path="chat" element={<RuangChat />} />

          <Route path="pengumuman">
            <Route index element={<AdminPengumuman />} />
            <Route path="create" element={<CreatePengumuman />} />
            <Route path="edit/:id" element={<EditPengumuman />} />
          </Route>

          <Route path="profile/edit" element={<EditProfile />} />
        </Route>

        {/* penyewa */}
        <Route path="/penyewa" element={<PenyewaLayout />}>
          <Route index element={<DashboardPenyewa />} />
          <Route path="kontrak-sewa" element={<PenyewaKontrak />} />
          <Route path="tagihan" element={<PenyewaTagihan />} />
          <Route path="pembayaran">
            <Route index element={<PenyewaPembayaran />} />
            <Route path="create/:tagihanId" element={<CreatePembayaranPenyewa />} />
          </Route>
          <Route path="laporan">
            <Route index element={<PenyewaLaporan />} />
            <Route path="create" element={<CreateLaporanPenyewa />} />
          </Route>
          <Route path="pengumuman" element={<PenyewaPengumuman />} />
          <Route path="chat" element={<RuangChat />} />
          <Route path="profile/edit" element={<EditProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
