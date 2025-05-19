export type Assistant = {
  id: string
  name: string
  description: string
  icon: string
  capabilities: string[]
}

export const assistants: Assistant[] = [
  {
    id: "oracle",
    name: "Oracle",
    description: "Asistente especializado en análisis de datos y predicciones basadas en patrones históricos.",
    icon: "database",
    capabilities: ["Análisis de datos", "Visualización", "Predicciones", "Estadísticas"],
  },
  {
    id: "sentinel",
    name: "Sentinel",
    description: "Monitoreo y seguridad avanzada para sistemas y redes con detección de anomalías.",
    icon: "shield",
    capabilities: ["Seguridad", "Monitoreo", "Alertas", "Análisis de riesgos"],
  },
  {
    id: "architect",
    name: "Architect",
    description: "Diseño y planificación de sistemas complejos con optimización de recursos.",
    icon: "layout",
    capabilities: ["Diseño de sistemas", "Optimización", "Planificación", "Diagramas"],
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Investigación académica y síntesis de conocimiento de múltiples fuentes.",
    icon: "book-open",
    capabilities: ["Investigación", "Síntesis", "Citaciones", "Resúmenes"],
  },
  {
    id: "creator",
    name: "Creator",
    description: "Generación de contenido creativo y asistencia en proyectos artísticos.",
    icon: "palette",
    capabilities: ["Contenido creativo", "Diseño", "Narrativa", "Conceptualización"],
  },
  {
    id: "navigator",
    name: "Navigator",
    description: "Guía personalizada para aprendizaje y desarrollo de habilidades específicas.",
    icon: "compass",
    capabilities: ["Aprendizaje guiado", "Desarrollo de habilidades", "Recursos", "Evaluación"],
  },
]
