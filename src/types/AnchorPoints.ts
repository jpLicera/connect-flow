import { Point } from "./Point";
import { ShapeSide } from "./ShapeSide";

export interface AnchorPoint extends Point {
  side: ShapeSide;
}
