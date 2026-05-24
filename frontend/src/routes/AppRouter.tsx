import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Navigation from '../components/Navigation'
import AdminDashboard from '../pages/AdminDashboard'
import AdminHoteles from '../pages/AdminHoteles'
import AdminNuevaReserva from '../pages/AdminNuevaReserva'
import AdminReservaDetalle from '../pages/AdminReservaDetalle'
import AdminReservas from '../pages/AdminReservas'
import AdminUsuarioDetalle from '../pages/AdminUsuarioDetalle'
import AdminUsuarios from '../pages/AdminUsuarios'
import BookingForm from '../pages/BookingForm'
import Home from '../pages/Home'
import HotelDetail from '../pages/HotelDetail'
import Login from '../pages/Login'
import MisReservas from '../pages/MisReservas'
import Register from '../pages/Register'
import AdminLayout from './AdminLayout'
import { AdminRoute, ProtectedRoute } from './ProtectedRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hoteles/:id" element={<HotelDetail />} />
        <Route
          path="/hoteles/:id/reservar"
          element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute>
              <MisReservas />
            </ProtectedRoute>
          }
        />

        {/* Admin con layout y sidebar */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reservas" element={<AdminReservas />} />
          <Route path="reservas/nueva" element={<AdminNuevaReserva />} />
          <Route path="reservas/:id" element={<AdminReservaDetalle />} />
          <Route path="hoteles" element={<AdminHoteles />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="usuarios/:id" element={<AdminUsuarioDetalle />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
