"use client";

import { useState } from "react";
import { Terminal as TerminalIcon, Gem, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSettingsPanel } from "@/components/ThemeSettings";
import { useCustomButtons } from "@/hooks/use-custom-buttons";
import { cn } from "@/lib/utils";

interface LeftPanelProps {
  onCommand: (command: string) => void;
}

export function LeftPanel({ onCommand }: LeftPanelProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { buttons, isLoaded } = useCustomButtons();
  const glowColor = 'var(--glowColor)';

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] rounded-lg">
      <div className="p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2 text-[#D4D4D4] mb-4">
          <Gem style={{ color: glowColor }} className="w-5 h-5" />
          <span className="font-semibold">Ruby</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Terminal button always first */}
        <Button
          variant="ghost"
          className="sidebar-button w-full justify-start"
          onClick={() => onCommand('terminal')}
        >
          <TerminalIcon style={{ color: glowColor }} className="w-5 h-5" />
          <span className="ml-2">Terminal</span>
        </Button>

        {/* Custom buttons - only render when loaded to prevent hydration mismatch */}
        {isLoaded && buttons.map((button) => (
          <Button
            key={button.id}
            variant="ghost"
            className="sidebar-button w-full justify-start"
            onClick={() => onCommand(button.command)}
          >
            <TerminalIcon style={{ color: glowColor }} className="w-5 h-5" />
            <span className="ml-2">{button.name}</span>
          </Button>
        ))}
      </div>

      <div className="p-4 border-t border-[#2A2A2A] space-y-2">
        <Button
          variant="ghost"
          className="action-button w-full justify-start"
          onClick={() => onCommand('/ai')}
        >
          <TerminalIcon style={{ color: glowColor }} className="w-5 h-5" />
          <span className="ml-2">AI Assistant</span>
        </Button>
        <Button
          variant="ghost"
          className="action-button w-full justify-start"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings style={{ color: glowColor }} className="w-5 h-5" />
          <span className="ml-2">Settings</span>
        </Button>
      </div>

      <ThemeSettingsPanel
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        trigger={null}
      />
    </div>
  );
}