import Link from "next/link"
import { MoveRight } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative elements inspired by Hollow Knight */}
      <div className="absolute w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-800 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="z-10 text-center px-4 max-w-3xl">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
          ORBIA
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Asistentes de inteligencia artificial potenciados con herramientas de MCP, diseñados para expandir los límites
          de lo posible.
        </p>

        <Link
          href="/assistants"
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-gray-500 rounded-md overflow-hidden transition-all duration-300 hover:border-white"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative z-10">Descubrir Asistentes</span>
          <MoveRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Subtle animated background effect */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gray-800 opacity-5"
            style={{
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </main>
  )
}
