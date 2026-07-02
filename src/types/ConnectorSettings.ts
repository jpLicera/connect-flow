import { ConnectorType } from "./ConnectorType";
import { SelectionType } from "./SelectionType";
import { ShapeSide } from "./ShapeSide";

export interface ConnectorSettings {
  color: string;
  opacity: number;
  strokeWidth: number;
  position: string;
  style: string;
  startArrow: string;
  endArrow: string;
  drawOnSelection: boolean;
  startAnchor: ShapeSide | null;
  endAnchor: ShapeSide | null;
  connectorType: ConnectorType;
  offset: number;
	selectionType: SelectionType;
}
