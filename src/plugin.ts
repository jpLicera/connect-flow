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
				strokeCapStart: settings.startCap === "none" ? undefined : settings.startCap as StrokeCap,
				strokeCapEnd: settings.endCap === "none" ? undefined : settings.endCap as StrokeCap,
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
  }
});

penpot.on("selectionchange", () => {

	const selection = penpot.selection.map(shape => ({
		name: shape.name,
		type: shape.type,
		id: shape.id
	}));

	penpot.ui.sendMessage({
		type: "selection-update",
		selection
	});
});

penpot.on("themechange", (theme) => {
	penpot.ui.sendMessage({
		type: "theme-change",
		theme,
	});
});
