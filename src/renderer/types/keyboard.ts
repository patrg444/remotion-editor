export type ModifierKey = 'shift' | 'ctrl' | 'alt' | 'meta';

export interface KeyboardShortcut {
  key: string;
  modifiers?: ModifierKey[];
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

export interface KeyboardShortcutGroup {
  name: string;
  shortcuts: KeyboardShortcut[];
}

export interface KeyboardShortcutMap {
  [key: string]: KeyboardShortcut[];
}

export interface KeyboardShortcutState {
  shortcuts: KeyboardShortcutMap;
  groups: KeyboardShortcutGroup[];
}

export interface RegisterShortcutOptions {
  group?: string;
  preventDefault?: boolean;
}

export interface KeyboardShortcutManager {
  registerShortcut: (
    key: string,
    description: string,
    action: () => void,
    modifiers?: ModifierKey[],
    options?: RegisterShortcutOptions
  ) => void;
  unregisterShortcut: (key: string, modifiers?: ModifierKey[]) => void;
  getShortcuts: () => KeyboardShortcutState;
}

export function getShortcutKey(key: string, modifiers?: ModifierKey[]): string {
  if (!modifiers || modifiers.length === 0) return key.toLowerCase();
  return [...modifiers.sort(), key.toLowerCase()].join('+');
}

export function matchesShortcut(e: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const key = e.key.toLowerCase();
  const modifiers = shortcut.modifiers || [];

  // Check if all required modifiers are pressed
  const hasAllModifiers = modifiers.every(mod => {
    switch (mod) {
      case 'shift': return e.shiftKey;
      case 'ctrl': return e.ctrlKey;
      case 'alt': return e.altKey;
      case 'meta': return e.metaKey;
      default: return false;
    }
  });

  // Check if no other modifiers are pressed
  const hasNoExtraModifiers = !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey || 
    modifiers.length > 0;

  return key === shortcut.key.toLowerCase() && hasAllModifiers && hasNoExtraModifiers;
}
