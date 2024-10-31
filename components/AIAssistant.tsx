"use client";

import { useEffect, useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OllamaWizard } from "@/components/OllamaWizard";
import { useOllama } from "@/lib/ollama";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  isFullscreen?: boolean;
}

export function AIAssistant({ isFullscreen = false }: AIAssistantProps) {
  const [darkGlow, setDarkGlow] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { generateResponse, isLoading, error } = useOllama();

  useEffect(() => {
    const hasOllamaConfig = localStorage.getItem('ollamaHost');
    setIsWizardOpen(!hasOllamaConfig);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFullscreen) {
      timeout = setTimeout(() => setDarkGlow(true), 7000);
    } else {
      setDarkGlow(false);
    }
    return () => clearTimeout(timeout);
  }, [isFullscreen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await generateResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or check your Ollama connection.' 
      }]);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "h-full rounded-lg overflow-hidden transition-all duration-1000",
          "terminal flex flex-col",
          darkGlow && "dark-glow"
        )}
      >
        <ScrollArea className="flex-1 p-6 bg-[#1A1A1A]" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-lg",
                  message.role === 'assistant' 
                    ? "bg-[#2A2A2A] text-[#D4D4D4]" 
                    : "bg-[#3A3A3A] text-[#E4E4E4]"
                )}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-[#808080]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            )}
            {error && (
              <div className="text-red-400 text-sm">
                Error: {error}
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t border-[#2A2A2A] bg-[#1A1A1A]">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#2A2A2A] border-[#3A3A3A] text-[#D4D4D4]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-[#2A2A2A] hover:bg-[#3A3A3A]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>

      <OllamaWizard 
        isOpen={isWizardOpen} 
        onOpenChange={setIsWizardOpen}
      />
    </>
  );
}