import { Shape } from "@penpot/plugin-types";
import { generatePath } from "./generate-path";
import { AnchorPoint } from "./types/AnchorPoints";
import { ConnectorSettings } from "./types/ConnectorSettings";
import { Point } from "./types/Point";
import { ShapeSide } from "./types/ShapeSide";

penpot.ui.open("ConnectFlow", `?theme=${penpot.theme}`, { width: 500, height: 700 });

// Send initial selection state
setTimeout(() => {
  const selection = penpot.selection.map(shape => ({
    name: shape.name,
    type: shape.type,
    id: shape.id
  }));

  penpot.ui.sendMessage({
    type: 'selection-update',
    selection: selection
  });
}, 100);

// Calculate anchor points for a shape
function getAnchorPoints(shape: Shape): AnchorPoint[] {
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

// Calculate distance between two points
function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Find the closest anchor points between two shapes
function findClosestAnchorPoints(shape1: Shape, shape2: Shape): { start: AnchorPoint, end: AnchorPoint } {
  const anchors1 = getAnchorPoints(shape1);
  const anchors2 = getAnchorPoints(shape2);

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

// Generate connector between two selected objects
function generateConnector(settings: ConnectorSettings) {
  const selected = penpot.selection;

  // Validate selection
  if (selected.length !== 2) {
    penpot.ui.sendMessage({
      type: 'notification',
      message: 'Please select exactly two objects to create a flow.'
    });
    return;
  }

  const [shape1, shape2] = selected;

  // Use manual anchor selection if available, otherwise find optimal anchor points
  let start: AnchorPoint;
  let end: AnchorPoint;

  if (settings.startAnchor && settings.endAnchor) {
    // Both anchors manually selected
    start = getAnchorPointBySide(shape1, settings.startAnchor);
    end = getAnchorPointBySide(shape2, settings.endAnchor);
  } else if (settings.startAnchor) {
    // Only start anchor manually selected
    start = getAnchorPointBySide(shape1, settings.startAnchor);
    // Find closest anchor on shape2 to the selected start anchor
    const anchors2 = getAnchorPoints(shape2);
    let minDistance = Infinity;
    end = anchors2[0];
    for (const anchor2 of anchors2) {
      const dist = distance(start, anchor2);
      if (dist < minDistance) {
        minDistance = dist;
        end = anchor2;
      }
    }
  } else if (settings.endAnchor) {
    // Only end anchor manually selected
    end = getAnchorPointBySide(shape2, settings.endAnchor);
    // Find closest anchor on shape1 to the selected end anchor
    const anchors1 = getAnchorPoints(shape1);
    let minDistance = Infinity;
    start = anchors1[0];
    for (const anchor1 of anchors1) {
      const dist = distance(anchor1, end);
      if (dist < minDistance) {
        minDistance = dist;
        start = anchor1;
      }
    }
  } else {
    // No manual selection, use automatic detection
    const closestPair = findClosestAnchorPoints(shape1, shape2);
    start = closestPair.start;
    end = closestPair.end;
  }

  // Apply offset to anchor points
  const offsetValue = settings.offset || 0;

  if (offsetValue > 0) {
    start = applyOffsetToAnchorPoint(start, offsetValue);
    end = applyOffsetToAnchorPoint(end, offsetValue);
  }

  // Try creating a path using SVG string (alternative approach)
  try {
    const pathData = generatePath({
      type: settings.connectorType,
      startPoint: start,
      endPoint: end,
      strokeWidth: settings.strokeWidth
    });

    // Create a minimal SVG with proper viewBox to avoid huge dimensions
    // Add extra padding to account for offset and stroke width
    const padding = Math.max(50, offsetValue + settings.strokeWidth + 10);
    const minX = Math.min(start.x, end.x) - padding;
    const minY = Math.min(start.y, end.y) - padding;
    const width = Math.abs(end.x - start.x) + (padding * 2);
    const height = Math.abs(end.y - start.y) + (padding * 2);

    const svgString = `<svg viewBox="${minX} ${minY} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="${pathData}" fill="none" stroke="${settings.color}" stroke-width="${settings.strokeWidth}"/>
    </svg>`;

    const connector = penpot.createShapeFromSvg(svgString);
    let finalConnector: any = connector;

    if (connector) {
      // Find the path inside the group recursively
      const findPath = (shape: any): any => {
        if (penpot.utils.types.isPath(shape)) {
          return shape;
        }
        if (shape.children) {
          for (const child of shape.children) {
            const found = findPath(child);
            if (found) return found;
          }
        }
        return null;
      };

      const pathShape = findPath(connector);

      if (pathShape) {

        // Apply styling to the path
        pathShape.fills = [];
        const strokeAlignment = settings.position as 'center' | 'inner' | 'outer';
        const strokeStyle = settings.style as 'solid' | 'dashed' | 'dotted' | 'mixed';

        // Build stroke object with caps
        const stroke: any = {
          strokeColor: settings.color,
          strokeOpacity: settings.opacity / 100,
          strokeWidth: settings.strokeWidth,
          strokeStyle: strokeStyle,
          strokeAlignment: strokeAlignment
        };

        // Add stroke caps if they are not 'none'
        if (settings.startArrow !== 'none') {
          stroke.strokeCapStart = settings.startArrow as 'round' | 'square' | 'line-arrow' | 'triangle-arrow' | 'square-marker' | 'circle-marker' | 'diamond-marker';
        }

        if (settings.endArrow !== 'none') {
          stroke.strokeCapEnd = settings.endArrow as 'round' | 'square' | 'line-arrow' | 'triangle-arrow' | 'square-marker' | 'circle-marker' | 'diamond-marker';
        }

        pathShape.strokes = [stroke];

        // Extract the path from the group using ungroup

        // Position the group correctly first
        connector.x = minX;
        connector.y = minY;

        // Before ungrouping, collect all non-path elements to delete them
        const elementsToDelete: any[] = [];
        if (connector.children) {
          for (const child of connector.children) {
            if (!penpot.utils.types.isPath(child)) {
              elementsToDelete.push(child);
            }
          }
        }

        // Ungroup the SVG to get individual elements
        if (penpot.utils.types.isGroup(connector)) {
          penpot.ungroup(connector);

          // Delete the unwanted elements (like base-background)
          for (const element of elementsToDelete) {
            try {
              element.remove();
            } catch (error) {
            }
          }

          // Use the path as our final connector
          finalConnector = pathShape;
        } else {
          finalConnector = connector;
        }
      } else {
        console.error('Could not find path shape in SVG group');
        finalConnector = connector;
      }

      const createdElements: any[] = [finalConnector];

      switch (settings.selectionType) {
        case 'start':
          penpot.selection = [shape1];
          break;
        case 'end':
          penpot.selection = [shape2];
          break;
      case 'maintain':
          penpot.selection = [shape1, shape2];
          break;
        default:
          // Select the created elements
          penpot.selection = createdElements;
      }

      penpot.ui.sendMessage({
        type: 'notification',
        message: 'Connector created successfully!'
      });
    }
  } catch (error) {
    console.error('Error creating connector:', error);
    penpot.ui.sendMessage({
      type: 'notification',
      message: 'Error creating connector. Please try again.'
    });
  }
}

// Handle messages from UI
penpot.ui.onMessage<any>((message) => {
  switch (message.type) {
    case 'generate-connector':
      generateConnector(message.settings);
      break;
    case 'settings-changed':
      // Update current settings to keep them in sync
      currentSettings = { ...message.settings };
      break;
  }
});

// Store current settings to access drawOnSelection
let currentSettings: ConnectorSettings = {
  color: "#000000",
  opacity: 100,
  strokeWidth: 2,
  position: "center",
  style: "solid",
  startArrow: "none",
  endArrow: "none",
  drawOnSelection: false,
  startAnchor: null,
  endAnchor: null,
  connectorType: "direct",
  offset: 0,
	selectionType: "connector"
};

// Auto-generate on selection change if enabled
penpot.on('selectionchange', () => {
  // Send selection info to UI for preview updates
  const selection = penpot.selection.map(shape => ({
    name: shape.name,
    type: shape.type,
    id: shape.id
  }));

  penpot.ui.sendMessage({
    type: 'selection-update',
    selection: selection
  });

  // Auto-generate connector if drawOnSelection is enabled and we have exactly 2 elements
  if (currentSettings.drawOnSelection && selection.length === 2) {
    generateConnector(currentSettings);
  }
});

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});
