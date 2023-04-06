export interface TooltipOptions {
  disabled?: boolean;
  hideDelay?: number;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showDelay?: number;
}

export interface Tooltip {
  enable(): void;

  disable(): void;

  destroy(): void;

  setMessage(message: string): void;
}
