import { ConnectorParameters } from "./types/ConnectorParameters";

export function pointsOverlap(settings: ConnectorParameters): boolean {
	const dx = Math.round(settings.endPoint.x - settings.startPoint.x);
	const dy = Math.round(settings.endPoint.y - settings.startPoint.y);
	return dx === 0 && dy === 0;
}
