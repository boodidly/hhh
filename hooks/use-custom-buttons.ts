"use client";

import { useState, useEffect } from 'react';

export interface CustomButton {
  id: string;
  name: string;
  command: string;
}

export function useCustomButtons() {
  const [buttons, setButtons] = useState<CustomButton[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedButtons = localStorage.getItem('customButtons');
    if (storedButtons) {
      setButtons(JSON.parse(storedButtons));
    }
    setIsLoaded(true);
  }, []);

  const addButton = (button: Omit<CustomButton, 'id'>) => {
    const newButton = {
      ...button,
      id: Date.now().toString()
    };
    const updatedButtons = [...buttons, newButton];
    setButtons(updatedButtons);
    localStorage.setItem('customButtons', JSON.stringify(updatedButtons));
  };

  const removeButton = (id: string) => {
    const updatedButtons = buttons.filter(button => button.id !== id);
    setButtons(updatedButtons);
    localStorage.setItem('customButtons', JSON.stringify(updatedButtons));
  };

  return {
    buttons,
    isLoaded,
    addButton,
    removeButton
  };
}