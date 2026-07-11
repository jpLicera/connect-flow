import { generatePath } from "./generate-path";
import { Settings } from "./types/Settings";
import { applyOffsetToAnchorPoints, getAnchorPoints } from "./anchor";
import { StrokeCap } from "@penpot/plugin-types";
import { applySelectionSettings } from "./selection";

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
function generateConnector(settings: Settings) {
	const selected = penpot.selection;

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

	try {

		const path = penpot.createPath();
		path.x = Math.min(start.x, end.x) - settings.offset;
		path.y = Math.min(start.y, end.y) - settings.offset;
		path.d = generatePath({
			type: settings.connectorType,
			startPoint: start,
			endPoint: end,
			strokeWidth: settings.strokeWidth
		});

		path.strokes = [
			{
				strokeColor: settings.color,
				strokeWidth: settings.strokeWidth,
				strokeAlignment: "center",
				strokeStyle: settings.style as 'solid' | 'dashed' | 'dotted' | 'mixed',
				strokeCapStart: settings.startArrow === "none" ? undefined : settings.startArrow as StrokeCap,
				strokeCapEnd: settings.endArrow === "none" ? undefined : settings.endArrow as StrokeCap,
				strokeOpacity: settings.opacity / 100
			}
		];

		penpot.selection = applySelectionSettings(settings.selectionType, path, shape1, shape2);
		penpot.ui.sendMessage({
			type: 'notification',
			message: 'Connector created successfully!'
		});
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
let currentSettings: Settings = {
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
