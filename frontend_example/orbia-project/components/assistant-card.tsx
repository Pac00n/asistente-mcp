import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Assistant } from "@/lib/data"
import Link from "next/link"
import { Database, Shield, Layout, BookOpen, Palette, Compass, ArrowRight, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AssistantCardProps {
  assistant: Assistant
}

export function AssistantCard({ assistant }: AssistantCardProps) {
  const icons: Record<string, LucideIcon> = {
    database: Database,
    shield: Shield,
    layout: Layout,
    "book-open": BookOpen,
    palette: Palette,
    compass: Compass,
  }

  const Icon = icons[assistant.icon] || Database

  return (
    <Link href={`/assistants/${assistant.id}`}>
      <Card className="group h-full border border-gray-800 bg-gradient-to-b from-gray-900 to-black transition-all duration-300 hover:border-gray-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <CardHeader className="pb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-3 group-hover:from-gray-600 group-hover:to-gray-800 transition-colors duration-300">
            <Icon className="w-6 h-6 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-white">{assistant.name}</h3>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-gray-400 text-sm">{assistant.description}</p>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {assistant.capabilities.slice(0, 3).map((capability) => (
              <Badge
                key={capability}
                variant="outline"
                className="bg-gray-800/50 text-gray-300 border-gray-700 text-xs"
              >
                {capability}
              </Badge>
            ))}
            {assistant.capabilities.length > 3 && (
              <Badge variant="outline" className="bg-gray-800/50 text-gray-300 border-gray-700 text-xs">
                +{assistant.capabilities.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center text-xs text-gray-500 mt-2 group-hover:text-gray-300 transition-colors duration-300">
            <span>Iniciar conversación</span>
            <ArrowRight className="ml-2 w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
