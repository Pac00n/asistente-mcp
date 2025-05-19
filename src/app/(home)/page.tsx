import { AnimatedLogo } from '@/components/AnimatedLogo';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center space-y-8">
        <AnimatedLogo />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Bienvenido al Asistente MCP
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
          Tu asistente virtual inteligente para gestionar tareas y responder preguntas
          con la potencia de la inteligencia artificial.
        </p>
        <div className="pt-6">
          <a
            href="/chat"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Comenzar
            <svg
              className="w-5 h-5 ml-2 -mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
