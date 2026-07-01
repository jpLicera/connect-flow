import { AnchorPoint } from "./AnchorPoints";
import { ConnectorType } from "./ConnectorType";

export interface ConnectorTypeOptions {
  type: ConnectorType;
  startPoint: AnchorPoint;
  endPoint: AnchorPoint;
  strokeWidth: number
}
