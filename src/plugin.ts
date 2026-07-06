import { generatePath } from "./generate-path";
import { ConnectorSettings } from "./types/ConnectorSettings";
import { applyOffsetToAnchorPoints, getAnchorPoints } from "./anchor";
import { Shape } from "@penpot/plugin-types";

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

	const anchorPoints = getAnchorPoints(settings, shape1, shape2);
	const [start, end] = applyOffsetToAnchorPoints(anchorPoints, settings.offset);

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
    const padding = Math.max(50, settings.offset + settings.strokeWidth + 10);
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

			penpot.selection = applyPostSelectionSettings(settings, finalConnector, shape1, shape2);

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

function applyPostSelectionSettings(settings: ConnectorSettings, connector: Shape, shape1: Shape, shape2: Shape) : Shape[] {
	const s = {
		start: [shape1],
		end: [shape2],
		maintain: [shape1, shape2],
		connector: [connector]
	}

	return s[settings.selectionType];
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
