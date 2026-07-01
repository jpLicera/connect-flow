import { ConnectorType } from "./ConnectorType";

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
	selectionType: string;
}
