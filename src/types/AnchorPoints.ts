import { Point } from "./Point";

export interface AnchorPoint extends Point {
  side: 'top' | 'right' | 'bottom' | 'left';
}
