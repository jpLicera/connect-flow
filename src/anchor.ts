import { AnchorPoint } from "./types/AnchorPoints";
import { Point, Shape } from "@penpot/plugin-types";
import { ShapeSide } from "./types/ShapeSide";
import { ConnectorSettings } from "./types/ConnectorSettings";

export function getAnchorPoints(settings: ConnectorSettings, shape1: Shape, shape2: Shape): [AnchorPoint, AnchorPoint] {

	if (settings.startAnchor && settings.endAnchor) {
		return [
			getAnchorPointBySide(shape1, settings.startAnchor),
			getAnchorPointBySide(shape2, settings.endAnchor)
		];
	}

	if (settings.startAnchor) {
		const start = getAnchorPointBySide(shape1, settings.startAnchor);
		// Find closest anchor on shape2 to the selected start anchor
		const anchors2 = getShapeAnchorPoints(shape2);
		let minDistance = Infinity;
		let end = anchors2[0];
		for (const anchor2 of anchors2) {
			const dist = distance(start, anchor2);
			if (dist < minDistance) {
				minDistance = dist;
				end = anchor2;
			}
		}

		return [start, end];
	}

	if (settings.endAnchor) {
		const end = getAnchorPointBySide(shape2, settings.endAnchor);
		// Find closest anchor on shape1 to the selected end anchor
		const anchors1 = getShapeAnchorPoints(shape1);
		let minDistance = Infinity;
		let start = anchors1[0];
		for (const anchor1 of anchors1) {
			const dist = distance(anchor1, end);
			if (dist < minDistance) {
				minDistance = dist;
				start = anchor1;
			}
		}
		return [start, end];
	}

	const closestPair = findClosestAnchorPoints(shape1, shape2);
	return [closestPair.start, closestPair.end]
}

export function applyOffsetToAnchorPoints(anchors: [AnchorPoint, AnchorPoint], offset: number): [AnchorPoint, AnchorPoint]{
  if (offset > 0) {
		return [
			applyOffsetToAnchorPoint(anchors[0], offset),
			applyOffsetToAnchorPoint(anchors[1], offset)
		]
  }

	return anchors;
}

function getShapeAnchorPoints(shape: Shape): AnchorPoint[] {
	const centerX = shape.x + shape.width / 2;
	const centerY = shape.y + shape.height / 2;

	return [
		{ x: centerX, y: shape.y, side: ShapeSide.top },
		{ x: shape.x + shape.width, y: centerY, side: ShapeSide.right },
		{ x: centerX, y: shape.y + shape.height, side: ShapeSide.bottom },
		{ x: shape.x, y: centerY, side: ShapeSide.left }
	];
}

// Get specific anchor point by side
function getAnchorPointBySide(shape: Shape, side: ShapeSide): AnchorPoint {
	const centerX = shape.x + shape.width / 2;
	const centerY = shape.y + shape.height / 2;

	switch (side) {
		case ShapeSide.top:
			return { x: centerX, y: shape.y, side: ShapeSide.top };
		case ShapeSide.right:
			return { x: shape.x + shape.width, y: centerY, side: ShapeSide.right };
		case ShapeSide.bottom:
			return { x: centerX, y: shape.y + shape.height, side: ShapeSide.bottom };
		case ShapeSide.left:
			return { x: shape.x, y: centerY, side: ShapeSide.left };
	}
}

// Find the closest anchor points between two shapes
function findClosestAnchorPoints(shape1: Shape, shape2: Shape): { start: AnchorPoint, end: AnchorPoint } {
	const anchors1 = getShapeAnchorPoints(shape1);
	const anchors2 = getShapeAnchorPoints(shape2);

	let minDistance = Infinity;
	let closestPair = { start: anchors1[0], end: anchors2[0] };

	for (const anchor1 of anchors1) {
		for (const anchor2 of anchors2) {
			const dist = distance(anchor1, anchor2);
			if (dist < minDistance) {
				minDistance = dist;
				closestPair = { start: anchor1, end: anchor2 };
			}
		}
	}

	return closestPair;

}

// Apply offset to anchor point based on its side
function applyOffsetToAnchorPoint(anchorPoint: AnchorPoint, offsetValue: number): AnchorPoint {
	const { x, y, side } = anchorPoint;

	switch (side) {
		case ShapeSide.top:
			return { x, y: y - offsetValue, side };
		case ShapeSide.bottom:
			return { x, y: y + offsetValue, side };
		case ShapeSide.left:
			return { x: x - offsetValue, y, side };
		case ShapeSide.right:
			return { x: x + offsetValue, y, side };
		default:
			return anchorPoint;
	}
}

// Calculate distance between two points
function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
