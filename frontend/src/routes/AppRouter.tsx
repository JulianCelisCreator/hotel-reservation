import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Navigation from '../components/Navigation'
import AdminReservaDetalle from '../pages/AdminReservaDetalle'
import AdminReservas from '../pages/AdminReservas'
import BookingForm from '../pages/BookingForm'
import Home from '../pages/Home'
import HotelDetail from '../pages/HotelDetail'
import Login from '../pages/Login'
import MisReservas from '../pages/MisReservas'
import Register from '../pages/Register'
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
        <Route
          path="/admin/reservas"
          element={
            <AdminRoute>
              <AdminReservas />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reservas/:id"
          element={
            <AdminRoute>
              <AdminReservaDetalle />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
