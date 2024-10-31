"use client";

import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOllama } from '@/lib/ollama';

interface OllamaWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OllamaWizard({ isOpen, onOpenChange }: OllamaWizardProps) {
  const [host, setHost] = useState('http://localhost:11434');
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { testConnection } = useOllama();

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    setErrorMessage('');

    try {
      await testConnection(host);
      setStatus('success');
      localStorage.setItem('ollamaHost', host);
      setTimeout(() => onOpenChange(false), 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect to Ollama');
    }
  }, [host, onOpenChange, testConnection]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1A1A] text-[#D4D4D4] border-[#2A2A2A]">
        <DialogHeader>
          <DialogTitle>Connect to Ollama</DialogTitle>
          <DialogDescription>
            Configure your connection to the Ollama API server
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ollama API Host</Label>
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="http://localhost:11434"
              className="bg-[#2A2A2A] border-[#3A3A3A]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={checkConnection}
              disabled={status === 'checking' || status === 'success'}
              className="bg-[#2A2A2A] hover:bg-[#3A3A3A]"
            >
              {status === 'checking' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              )}
              {status === 'error' && (
                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              )}
              Test Connection
            </Button>
          </div>

          {status === 'error' && (
            <div className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Successfully connected to Ollama
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}