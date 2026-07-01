import { ConnectorType } from "./ConnectorType";
import { SelectionType } from "./SelectionType";

export interface ConnectorSettings {
  color: string;
  opacity: number;
  strokeWidth: number;
  position: string;
  style: string;
  startArrow: string;
  endArrow: string;
  drawOnSelection: boolean;
  startAnchor: string | null;
  endAnchor: string | null;
  connectorType: ConnectorType;
  offset: number;
	selectionType: SelectionType;
}
