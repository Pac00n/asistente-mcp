import { assistants } from "@/lib/data"
import { ChatInterface } from "@/components/chat-interface"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export default function AssistantPage({ params }: { params: { id: string } }) {
  const assistant = assistants.find((a) => a.id === params.id)

  if (!assistant) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto h-[calc(100vh-3rem)]">
        <div className="mb-4">
          <Link
            href="/assistants"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Volver a asistentes</span>
          </Link>
        </div>

        <div className="h-[calc(100%-2rem)]">
          <ChatInterface assistant={assistant} />
        </div>
      </div>
    </main>
  )
}
