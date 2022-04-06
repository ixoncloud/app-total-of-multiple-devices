declare module 'liquid-tank' {
  export default class LiquidTank {
    constructor(element: HTMLElement, options: Options);

    clear(): void;

    config(options: ConfigOptions): this;

    destroy(): void;

    render(): this;

    setValue(value: number): void;

    onResize(): void;
  }

  interface Options {
    // Minimum value
    min?: number;

    // Maximum value
    max?: number;

    // List of segments.
    segments?: Segment[];

    // Style of the tank fill.
    fillStyle?: FillStyle;

    // When set to true it adjusts colors for a darker background.
    dark?: boolean;

    // Font family for the displayed value
    fontFamily?: string;

    // Font size for the displayed value
    fontSize?: number;

    // Function used to format the displayed value.
    valueFormatter?: (value: number) => string;
  }

  interface ConfigOptions {
    // Minimum value
    min?: number;

    // Maximum value
    max?: number;
  }

  interface Segment {
    color: string;
    startValue: number;
    endValue: number;
  }

  type FillStyle = 'solid' | 'segmented';
}
