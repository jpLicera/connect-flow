import { AnchorPoint } from "./types/AnchorPoints";
import { ConnectorTypeOptions } from "./types/ConnectorTypeOptions";
import { Point } from "./types/Point";
import { ShapeSide } from "./types/ShapeSide";
import { SidePair } from "./types/ShapeSidePair";
import { path_drawing_map } from "./path-drawing-map";
import { AlignmentPair } from "./types/AlignmentPair";
import { VerticalAlignment } from "./types/VerticalAlignment";
import { HorizontalAlignment } from "./types/HorizontalAlignment";
import { PathDrawingParameters } from "./types/PathDrawingParameters";

/**
 * Genera el path SVG según el tipo de conector seleccionado
 */
export function generatePath(options: ConnectorTypeOptions): string {
	const { type, startPoint, endPoint } = options;

	switch (type) {
		case 'direct':
			return generateDirectPath(startPoint, endPoint);
		case 'orthogonal':
			return generateOrthogonalPath(options);
		case 'curve':
			return generateCurvePath(startPoint, endPoint);
		default:
			return generateDirectPath(startPoint, endPoint);
	}
}

/**
 * Modo Direct: Línea recta entre dos puntos
 */
function generateDirectPath(start: Point, end: Point): string {
	return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

/**
 * Modo Orthogonal: Conexión con ángulos rectos (90 grados)
 * Maneja diferentes tipos de conexiones según los lados de anclaje
 */
function generateOrthogonalPath(options: ConnectorTypeOptions): string {
	const dx = options.endPoint.x - options.startPoint.x;
	const dy = options.endPoint.y - options.startPoint.y;

	const sidePair: SidePair = `${options.startPoint.side}${options.endPoint.side}`;
	const alignmentPair: AlignmentPair = getAlignmentPair(dx, dy);

	// clearance between the resulting path and the selected sides, used when the
	// start and end points are aligned, and a u turn is needed instead of a zigzag
	const offset = Math.floor(options.strokeWidth * 1.5);

	const params: PathDrawingParameters = {
		x1: options.startPoint.x,
		x2: options.endPoint.x,
		y1: options.startPoint.y,
		y2: options.endPoint.y,
		dx,
		dy,
		adx: Math.abs(dx),
		ady: Math.abs(dy),
		o: offset,
	}

	return createOrthogonalPath(alignmentPair, sidePair, params);
}

function getAlignmentPair(deltaX: number, deltaY: number) : AlignmentPair {
	const x = Math.round(deltaX);
	const y = Math.round(deltaY);

	const ha : HorizontalAlignment = x === 0 ? HorizontalAlignment.center : x < 0 ? HorizontalAlignment.left : HorizontalAlignment.right;
	const va : VerticalAlignment = y === 0 ? VerticalAlignment.center : y > 0 ? VerticalAlignment.down : VerticalAlignment.up

	const result = `${ha}${va}`;

	if (result == "cc") {
		throw new Error("The start and end points are overlapping!");
	}

	return result as AlignmentPair;
}

function createOrthogonalPath(alignmentPair: AlignmentPair, sidePair: SidePair, params: PathDrawingParameters) {
	return `M ${params.x1} ${params.y1} ${path_drawing_map[alignmentPair][sidePair](params)} L ${params.x2} ${params.y2}`;
}

/**
 * Modo Curve: Conexión con curvas suaves
 * Maneja diferentes tipos de conexiones según los lados de anclaje, usando curvas en lugar de ángulos
 */
function generateCurvePath(start: AnchorPoint, end: AnchorPoint): string {
	const { x: x1, y: y1, side: startSide } = start;
	const { x: x2, y: y2, side: endSide } = end;

	const deltaX = x2 - x1;
	const deltaY = y2 - y1;
	const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

	// Factor de curvatura adaptativo
	const minCurveFactor = 30;
	const curveFactor = Math.max(minCurveFactor, Math.min(distance / 3, 120));

	// Clasificar el tipo de conexión basado en los lados de anclaje
	const startIsHorizontal = startSide === ShapeSide.left || startSide === ShapeSide.right;
	const endIsHorizontal = endSide === ShapeSide.left || endSide === ShapeSide.right;
	const startIsVertical = startSide === ShapeSide.top || startSide === ShapeSide.bottom;
	const endIsVertical = endSide === ShapeSide.top || endSide === ShapeSide.bottom;

	if (startIsHorizontal && endIsHorizontal) {
		// CASO HORIZONTAL: left/right ↔ left/right (curva tipo "S" horizontal)
		const midX = x1 + deltaX / 2;

		// Puntos de control para crear una curva suave tipo "S"
		const c1x = x1 + (deltaX >= 0 ? curveFactor : -curveFactor);
		const c1y = y1;
		const c2x = midX;
		const c2y = y1;
		const c3x = midX;
		const c3y = y2;
		const c4x = x2 - (deltaX >= 0 ? curveFactor : -curveFactor);
		const c4y = y2;

		// Usar múltiples curvas para crear el efecto zigzag suave
		return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${midX} ${y1 + (y2 - y1) * 0.5} C ${c3x} ${c3y}, ${c4x} ${c4y}, ${x2} ${y2}`;

	} else if (startIsVertical && endIsVertical) {
		// CASO VERTICAL: top/bottom ↔ top/bottom (curva tipo "S" vertical)
		const midY = y1 + deltaY / 2;

		// Puntos de control para crear una curva suave tipo "S"
		const c1x = x1;
		const c1y = y1 + (deltaY >= 0 ? curveFactor : -curveFactor);
		const c2x = x1;
		const c2y = midY;
		const c3x = x2;
		const c3y = midY;
		const c4x = x2;
		const c4y = y2 - (deltaY >= 0 ? curveFactor : -curveFactor);

		// Usar múltiples curvas para crear el efecto zigzag suave
		return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x1 + (x2 - x1) * 0.5} ${midY} C ${c3x} ${c3y}, ${c4x} ${c4y}, ${x2} ${y2}`;

	} else if (startIsHorizontal && endIsVertical) {
		// CASO MIXTO: left/right → top/bottom (curva simple con una esquina suave)
		const c1x = x1 + (deltaX >= 0 ? curveFactor : -curveFactor);
		const c1y = y1;
		const c2x = x2;
		const c2y = y2 - (deltaY >= 0 ? curveFactor : -curveFactor);

		return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c1y}, ${x2} ${y1 + (y2 - y1) * 0.5} C ${c2x} ${c2y}, ${x2} ${c2y}, ${x2} ${y2}`;

	} else if (startIsVertical && endIsHorizontal) {
		// CASO MIXTO: top/bottom → left/right (curva simple con una esquina suave)
		const c1x = x1;
		const c1y = y1 + (deltaY >= 0 ? curveFactor : -curveFactor);
		const c2x = x2 - (deltaX >= 0 ? curveFactor : -curveFactor);
		const c2y = y2;

		return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c1x} ${y2}, ${x1 + (x2 - x1) * 0.5} ${y2} C ${c2x} ${c2y}, ${c2x} ${y2}, ${x2} ${y2}`;

	} else {
		// Fallback: curva simple basada en distancia
		const isHorizontalPrimary = Math.abs(deltaX) > Math.abs(deltaY);

		if (isHorizontalPrimary) {
			const c1x = x1 + (deltaX >= 0 ? curveFactor : -curveFactor);
			const c1y = y1;
			const c2x = x2 - (deltaX >= 0 ? curveFactor : -curveFactor);
			const c2y = y2;
			return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
		} else {
			const c1x = x1;
			const c1y = y1 + (deltaY >= 0 ? curveFactor : -curveFactor);
			const c2x = x2;
			const c2y = y2 - (deltaY >= 0 ? curveFactor : -curveFactor);
			return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
		}
	}
}
