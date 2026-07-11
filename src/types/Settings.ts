import { ConnectorType } from "./ConnectorType";
import { SelectionType } from "./SelectionType";
import { ShapeSide } from "./ShapeSide";

export interface Settings {
	color: string;
	opacity: number;
	strokeWidth: number;
	position: string;
	style: string;
	startCap: string;
	endCap: string;
	drawOnSelection: boolean;
	startAnchor: ShapeSide | null;
	endAnchor: ShapeSide | null;
	connectorType: ConnectorType;
	offset: number;
	selectionType: SelectionType;
}
