export interface ColorPickerOptions {
  initialColor?: string;
  initialOpacity?: number;
  onColorChange?: (color: string, opacity: number) => void;
  onClose?: () => void;
}
