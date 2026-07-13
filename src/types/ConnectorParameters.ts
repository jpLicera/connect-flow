import { AnchorPoint } from "./AnchorPoints";
import { Settings } from "./Settings";

export interface ConnectorParameters {
	readonly settings: Settings;
  readonly startPoint: AnchorPoint;
  readonly endPoint: AnchorPoint;
}
