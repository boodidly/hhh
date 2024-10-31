"use client";

import { useState, useCallback } from 'react';

export interface OllamaMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export const useOllama = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHost = useCallback(() => {
    return localStorage.getItem('ollamaHost') || 'http://localhost:11434';
  }, []);

  const testConnection = useCallback(async (host: string): Promise<boolean> => {
    try {
      const response = await fetch(`${host}/api/tags`);
      if (!response.ok) throw new Error('Failed to connect to Ollama');
      return true;
    } catch (error) {
      throw new Error('Could not connect to Ollama. Is it running?');
    }
  }, []);

  const generateResponse = useCallback(async (
    prompt: string,
    model: string = 'llama2:1b',
    onToken?: (token: string) => void
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const host = getHost();
      const response = await fetch(`${host}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: !!onToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onToken) {
        const reader = response.body?.getReader();
        let fullResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(Boolean);

            for (const line of lines) {
              const data: OllamaResponse = JSON.parse(line);
              onToken(data.response);
              fullResponse += data.response;
            }
          }
        }
        return fullResponse;
      } else {
        const data: OllamaResponse = await response.json();
        return data.response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getHost]);

  return {
    generateResponse,
    testConnection,
    isLoading,
    error,
  };
};