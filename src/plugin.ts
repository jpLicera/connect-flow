import { generatePath } from "./path";
import { Settings } from "./types/Settings";
import { applySelectionSettings } from "./selection";
import { pointsOverlap as pointsOverlap } from "./validation";
import { Shape, StrokeCap } from "@penpot/plugin-types";
import { ConnectorParameters } from "./types/ConnectorParameters";
import { applyOffsetToAnchorPoints, getAnchorPoints } from "./anchor";

penpot.ui.open("ConnectFlow", `?theme=${penpot.theme}`, { width: 450, height: 575 });

setTimeout(() => {
	const selection = penpot.selection.map(shape => ({
		name: shape.name,
	}));

	penpot.ui.sendMessage({
		type: "initialize",
		selection: selection
	});
}, 100);

function notify(type: string, message: string): void {
	penpot.ui.sendMessage({
		type: "notification",
		message: message,
		notificationType: type
	});
}

function generateConnector(settings: Settings, selection: Shape[]): void {
	if (selection.length !== 2) {
		notify("error", "Please select exactly two objects to create a connector.");
		return;
	}

	const anchorPoints = getAnchorPoints(settings, selection[0], selection[1]);
	const [start, end] = applyOffsetToAnchorPoints(anchorPoints, settings.offset);

	const connectorParameters: ConnectorParameters = {
		startPoint: start,
		endPoint: end,
		settings
	};

	if(pointsOverlap(connectorParameters)) {
		notify("error", "The start and end points are overlapping.");
		return;
	}

	const historyBlockId = penpot.history.undoBlockBegin();

	const path = penpot.createPath();
	path.x = Math.min(start.x, end.x) - settings.offset;
	path.y = Math.min(start.y, end.y) - settings.offset;
	path.d = generatePath(connectorParameters);

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

	penpot.history.undoBlockFinish(historyBlockId);

	penpot.selection = applySelectionSettings(settings.selectionType, path, selection[0], selection[1]);
	notify("success", "Connector created.");
}

penpot.ui.onMessage<any>(message => {
	if (message.type === "generate-connector") {
		generateConnector(message.settings, penpot.selection);
	}
});

penpot.on("selectionchange", () => {

	const selection = penpot.selection.map(shape => ({
		name: shape.name
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
