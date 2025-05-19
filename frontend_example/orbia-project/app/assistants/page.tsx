import { assistants } from "@/lib/data"
import { AssistantCard } from "@/components/assistant-card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AssistantsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Asistentes ORBIA
          </h1>
          <p className="text-gray-400 max-w-3xl">
            Descubre nuestros asistentes especializados, cada uno diseñado para potenciar diferentes aspectos de tu
            trabajo con inteligencia artificial avanzada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assistants.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} />
          ))}
        </div>
      </div>
    </main>
  )
}
