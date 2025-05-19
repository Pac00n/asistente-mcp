import ChatInterface from '@/components/ChatInterface'; // Ajustar esta ruta según la nueva estructura del proyecto de destino

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Asistente MCP</h1>
        <ChatInterface />
      </div>
    </main>
  );
}
