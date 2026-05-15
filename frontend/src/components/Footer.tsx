export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm">
        <p className="font-semibold text-white mb-1">HotelRes</p>
        <p>© {new Date().getFullYear()} Hotel Reservation System. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
