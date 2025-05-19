"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAssistantById } from "@/lib/assistants"; // Assuming this function exists and returns Assistant or null
import { ArrowLeft, Send, Loader2, Paperclip, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Tipos
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  imageBase64?: string | null;
};

// Placeholder for Assistant type, replace with your actual type definition
type Assistant = {
  id: string;
  name: string;
  description?: string;
  bgColor?: string;
  // Add other properties your assistant object might have
};

// Estilos globales - Consider moving to a global CSS file if extensive
const globalStyles = `
@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
.animated-dot {
  display: inline-block;
  animation: bounce-dot 1.2s infinite ease-in-out both;
  font-size: 24px;
  line-height: 12px;
  font-weight: bold;
  color: white; /* Or inherit from parent */
}
.animated-dot:nth-child(1) { animation-delay: 0s; }
.animated-dot:nth-child(2) { animation-delay: 0.2s; }
.animated-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes spin-slow {
  100% { transform: rotate(360deg); }
}

.spin-slow { 
  animation: spin-slow 2.5s linear infinite; 
}

@keyframes gradient-move {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.btn-gradient-animated {
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981, #3b82f6);
  background-size: 300% 100%;
  animation: gradient-move 4s ease infinite;
  box-shadow: 0 4px 20px 0 rgba(16,185,129,0.4);
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  font-weight: 700;
  border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  color: white !important;
  background-color: #2563eb; /* Base color */
}

.btn-gradient-animated:hover {
  filter: brightness(1.2) saturate(1.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 25px 0 rgba(16,185,129,0.4);
}

.timestamp-outside {
  display: block;
  text-align: center;
  font-size: 0.75rem; /* 12px */
  color: #9ca3af; /* gray-400 */
  margin-top: 0.25rem; /* 4px */
  margin-bottom: 0.5rem; /* 8px */
}
`;

// Componente para mostrar puntos de carga
const AnimatedDots = () => (
  <span className="inline-flex gap-0.5">
    <span className="animated-dot">.</span>
    <span className="animated-dot">.</span>
    <span className="animated-dot">.</span>
  </span>
);

function formatAssistantMessage(content: string) {
  // Implement your specific formatting logic here if needed
  return content;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assistantId = searchParams.get("id");

  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamControllerRef = useRef<AbortController | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (assistantId) {
      // Ensure getAssistantById is robust and handles not found cases gracefully
      const fetchedAssistant = getAssistantById(assistantId as string);
      if (fetchedAssistant) {
        setAssistant(fetchedAssistant);
      } else {
        setError("Asistente no encontrado. Verifica el ID proporcionado.");
        // Optionally redirect or show a more specific message
        // router.push('/assistants'); 
      }
    } else {
      // setError("ID de asistente no proporcionado en la URL.");
      // router.push('/assistants'); // Redirect if no ID, or handle as needed
    }
  }, [assistantId, router]);


  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setRotation(scrollY * 0.2);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showWelcomeMessage = useCallback(() => {
    if (assistant) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `¡Hola! Soy ${assistant.name}. ¿En qué puedo ayudarte hoy?`,
          timestamp: new Date(),
          isStreaming: false,
        },
      ]);
    }
  }, [assistant]);

  useEffect(() => {
    if (!assistantId || !assistant) return;
    try {
      const storedThreadId = localStorage.getItem(`threadId_${assistantId}`);
      if (storedThreadId) {
        setCurrentThreadId(storedThreadId);
        const storedMessages = localStorage.getItem(`messages_${assistantId}`);
        if (storedMessages) {
          try {
            const parsedMessages = JSON.parse(storedMessages);
            const messagesWithDates = parsedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
              isStreaming: false,
            }));
            setMessages(messagesWithDates);
          } catch (e) {
            console.error("Error al cargar mensajes anteriores:", e);
            showWelcomeMessage();
          }
        } else {
          showWelcomeMessage();
        }
      } else {
        showWelcomeMessage();
      }
    } catch (e) {
      console.error("Error al inicializar el chat:", e);
      showWelcomeMessage();
    }
  }, [assistantId, showWelcomeMessage, assistant]);

  useEffect(() => {
    if (!assistantId || !assistant) return;
    const messagesToSave = messages.filter(msg => !msg.isStreaming);
    if (messagesToSave.length > 0 && currentThreadId && messagesToSave[0]?.id !== 'welcome') {
      try {
        localStorage.setItem(`messages_${assistantId}`, JSON.stringify(messagesToSave));
      } catch (e) {
        console.error("Error al guardar mensajes en localStorage:", e);
      }
    }
  }, [messages, assistantId, currentThreadId, assistant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageBase64) || isLoading) return;
    
    setError(null);
    setIsLoading(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      imageBase64,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImageBase64 = imageBase64;
    setInput("");
    setImageBase64(null);

    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
    }
    streamControllerRef.current = new AbortController();
    const signal = streamControllerRef.current.signal;

    let assistantMessagePlaceholderId: string | null = null;
    let accumulatedContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: assistant?.id,
          message: currentInput,
          imageBase64: currentImageBase64,
          threadId: currentThreadId,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error del servidor." }));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Respuesta sin cuerpo.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      assistantMessagePlaceholderId = `assistant-stream-${Date.now()}`;
      
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessagePlaceholderId!,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        let eolIndex;
        
        while ((eolIndex = buffer.indexOf('

')) !== -1) {
          const line = buffer.substring(0, eolIndex).trim();
          buffer = buffer.substring(eolIndex + 2);

          if (line.startsWith("data:")) {
            const jsonData = line.substring(5).trim();
            try {
              const event = JSON.parse(jsonData);

              if (event.threadId && event.threadId !== currentThreadId) {
                setCurrentThreadId(event.threadId);
                if (assistantId) localStorage.setItem(`threadId_${assistantId}`, event.threadId);
              }
              
              if (event.type === 'thread.info' && event.threadId && !currentThreadId) {
                setCurrentThreadId(event.threadId);
                 if (assistantId) localStorage.setItem(`threadId_${assistantId}`, event.threadId);
              }

              switch (event.type) {
                case 'thread.message.delta':
                  if (event.data.delta.content && event.data.delta.content[0].type === 'text') {
                    accumulatedContent += event.data.delta.content[0].text.value;
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessagePlaceholderId 
                        ? { ...msg, content: accumulatedContent, isStreaming: true } 
                        : msg
                    ));
                  }
                  break;
                case 'thread.message.completed':
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessagePlaceholderId 
                      ? { ...msg, content: accumulatedContent, isStreaming: false, id: event.data.id } 
                      : msg
                  ));
                  assistantMessagePlaceholderId = null;
                  accumulatedContent = "";
                  break;
                case 'thread.run.created':
                  console.log("Run created:", event.data.id);
                  setIsLoading(true);
                  break;
                case 'thread.run.completed':
                  setIsLoading(false);
                  setMessages(prev => prev.map(msg =>
                    (msg.role === 'assistant' && msg.isStreaming)
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
                  break;
                case 'thread.run.failed':
                case 'thread.run.cancelled':
                case 'thread.run.expired':
                  setError(event.data.last_error?.message || `Asistente finalizó con estado: ${event.type}`);
                  setIsLoading(false);
                  if (assistantMessagePlaceholderId) {
                    setMessages(prev => prev.filter(msg => msg.id !== assistantMessagePlaceholderId));
                  }
                  break;
                case 'error':
                  setError(event.data.details || event.data.message || "Error de stream.");
                  setIsLoading(false);
                  if (assistantMessagePlaceholderId) {
                    setMessages(prev => prev.filter(msg => msg.id !== assistantMessagePlaceholderId));
                  }
                  break;
                case 'stream.ended':
                  setIsLoading(false);
                  setMessages(prev => prev.map(msg =>
                    (msg.role === 'assistant' && msg.isStreaming)
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
                  if (event.error) {
                     setError(prevError => prevError || event.error);
                  }
                  console.log("Stream ended from backend.");
                  return; 
              }
            } catch (e) {
              console.error("Error parseando JSON del stream:", e, jsonData);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || "Error de conexión o enviando el mensaje.");
         setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
         setInput(currentInput);
         setImageBase64(currentImageBase64);
      }
      if (assistantMessagePlaceholderId) {
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessagePlaceholderId));
      }
    } finally {
      if (signal && (!signal.aborted || messages.every(msg => !msg.isStreaming))) {
         setIsLoading(false);
      }
      streamControllerRef.current = null;
    }
  };

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      console.error("Error al formatear la hora:", e);
      return "";
    }
  };

  const startNewConversation = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
    if (!assistantId) return;
    try {
      localStorage.removeItem(`threadId_${assistantId}`);
      localStorage.removeItem(`messages_${assistantId}`);
    } catch (e) {
      console.error("Error al eliminar datos de localStorage:", e);
    }
    setCurrentThreadId(null);
    setError(null);
    setInput("");
    setImageBase64(null);
    setIsLoading(false);
    showWelcomeMessage();
  };
  
  // Initial loading state for assistant or if ID is missing
  if (!assistantId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <Card className="w-full max-w-md bg-neutral-900 border-neutral-700 text-white relative z-10">
          <CardHeader><CardTitle className="text-center text-white">Asistente no especificado</CardTitle></CardHeader>
          <CardContent className="text-center text-gray-300"><p>No se ha proporcionado un ID de asistente en la URL.</p></CardContent>
          <CardFooter className="flex justify-center"><Button asChild className="bg-blue-600 hover:bg-blue-700 text-white"><Link href="/assistants">Seleccionar un Asistente</Link></Button></CardFooter>
        </Card>
      </div>
    );
  }

  if (!assistant && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
         <Loader2 className="h-8 w-8 animate-spin text-white" />
         <p className="text-white ml-2">Cargando asistente...</p>
      </div>
    );
  }

  if (error && !assistant) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <Card className="w-full max-w-md bg-neutral-900 border-neutral-700 text-white relative z-10">
          <CardHeader><CardTitle className="text-center text-white">Error al Cargar Asistente</CardTitle></CardHeader>
          <CardContent className="text-center text-gray-300"><p>{error}</p></CardContent>
          <CardFooter className="flex justify-center"><Button asChild className="bg-blue-600 hover:bg-blue-700 text-white"><Link href="/assistants">Ver otros asistentes</Link></Button></CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!assistant) { // Should not be reached if error handling above is correct, but as a safeguard
      return (
          <div className="flex items-center justify-center min-h-screen bg-neutral-950">
              <p className="text-white">No se pudo cargar la información del asistente.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white relative">
      <style>{globalStyles}</style>
      <div 
        className="fixed inset-0 flex justify-center items-center z-0 pointer-events-none" 
        style={{filter:'blur(12px)', opacity:0.15}} 
      >
        <div className="relative" style={{ width: '500px', height: '500px' }}>
          <Image src="/LogosNuevos/logo_orbia_sin_texto.png" alt="Logo Orbia Sin Texto Background" fill priority className="object-contain" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.1s linear'}}/>
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/30 border-l-4 border-red-600 p-4 fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md md:max-w-lg shadow-lg rounded-md backdrop-blur-sm"
            >
              <div className="flex">
                <div className="ml-3"><p className="text-sm text-red-100">Error: {error}</p></div>
                <button onClick={() => setError(null)} className="ml-auto -mr-1 -mt-1 text-red-200 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${error ? "pt-24" : "pt-6"} pb-48 sm:pb-52`}>
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div 
                  key={message.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3 }} 
                  className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`} // Use flex-col and items-end/start for alignment
                >
                  <div className={`flex max-w-[85%] sm:max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {message.role === "user" ? (
                      <div className="h-8 w-8 ml-2 sm:ml-3 bg-emerald-600 text-white flex items-center justify-center rounded-full font-semibold flex-shrink-0 shadow-md">U</div>
                    ) : (
                      <div className={`h-8 w-8 mr-2 sm:mr-3 ${assistant.bgColor || 'bg-sky-600'} text-white flex items-center justify-center rounded-full font-semibold flex-shrink-0 shadow-md`}>
                        {assistant?.name.charAt(0)}
                      </div>
                    )}
                    {message.role === "assistant" && message.isStreaming && !message.content.trim() ? (
                      <div className="rounded-lg shadow-md transition-all relative bg-neutral-800 text-gray-200 border border-neutral-700 px-4 py-2 flex items-center justify-center min-w-[40px] min-h-[40px]">
                        <AnimatedDots />
                      </div>
                    ) : (
                      <div className={`rounded-lg shadow-md transition-all relative ${message.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800 text-gray-200 border border-neutral-700"}`}>
                        {message.role === "user" && message.imageBase64 && (
                          <div className="p-2 border-b border-blue-500/50"><Image src={message.imageBase64} alt="Imagen adjunta" width={200} height={150} className="rounded-md object-cover" /></div>
                        )}
                        {(message.content || message.isStreaming) && (
                          <div className="p-3">
                            <div className="whitespace-pre-wrap prose prose-sm prose-invert max-w-none">
                              {message.role === "assistant" ? (
                                <ReactMarkdown>{formatAssistantMessage(message.content)}</ReactMarkdown>
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`timestamp-outside ${message.role === "user" ? "text-right w-[85%] sm:w-[80%]" : "text-left w-[85%] sm:w-[80%]"}`}>{formatTime(message.timestamp)}</span> {/* Adjusted timestamp alignment */}
                  {message.id === "welcome" && <div className={`absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400 animate-ping ${message.content ? "" : "hidden"}`}></div>}
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && !messages.some(m => m.role === 'assistant' && m.isStreaming) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mt-4" // This will show "Conectando..." on the left
              >
                 <div className={`flex items-center max-w-[85%] sm:max-w-[80%]`}>
                    <div className={`h-8 w-8 mr-2 sm:mr-3 ${assistant.bgColor || 'bg-sky-600'} text-white flex items-center justify-center rounded-full font-semibold flex-shrink-0 shadow-md`}>{assistant?.name.charAt(0)}</div>
                    <div className="rounded-lg p-3 bg-neutral-800 border border-neutral-700 flex items-center shadow-md">
                      <AnimatedDots />
                      <span className="ml-2 text-sm text-gray-400">Conectando</span>
                    </div>
                  </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-neutral-900/80 backdrop-blur-md border-t border-neutral-800 p-3 sm:p-4 sticky bottom-0 z-40 transition-all duration-200 ease-in-out">
          <div className="max-w-3xl mx-auto">
            <TooltipProvider>
              <div className="flex justify-between items-center mb-2 sm:mb-3 px-1">
                <Link href="/assistants" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-sm text-gray-300 hover:text-white">
                  <ArrowLeft className="h-4 w-4" /><span>Volver</span>
                </Link>
              </div>
            </TooltipProvider>
            <AnimatePresence>
              {imageBase64 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative mb-2 p-2 border border-neutral-700 rounded-md max-w-[100px] bg-neutral-800/50">
                  <Image src={imageBase64} alt="Preview" width={80} height={60} className="rounded object-cover" />
                  <button onClick={() => setImageBase64(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow-md"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="border-neutral-700 text-gray-400 hover:text-white hover:bg-neutral-800 p-2 flex-shrink-0" disabled={isLoading}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={isLoading} />
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 rounded-lg bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:ring-offset-neutral-900 py-2 px-3 min-h-[40px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <Button type="submit" disabled={isLoading || (!input.trim() && !imageBase64)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 p-2 flex-shrink-0">
                {isLoading && messages.some(m=>m.isStreaming) ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {isLoading && messages.some(m=>m.isStreaming) ? 'Asistente está respondiendo...' : isLoading ? 'Procesando...' : 'Las conversaciones se guardan en este navegador.'}
            </div>
            <div className="fixed right-5 bottom-24 z-50">
              <Button
                onClick={startNewConversation}
                className="btn-gradient-animated flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                style={{ backgroundColor: '#2563eb' }} 
              >
                <span className="spin-slow"><RefreshCw className="h-4 w-4" /></span>
                Nueva conversación
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
