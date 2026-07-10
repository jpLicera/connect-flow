import { Shape } from "@penpot/plugin-types";
import { SelectionType } from "./types/SelectionType";

export function applySelectionSettings(selectionType: SelectionType, connector: Shape, shape1: Shape, shape2: Shape) : Shape[] {
	const s = {
		none: [],
		start: [shape1],
		end: [shape2],
		connector: [connector]
	}

	return s[selectionType];
}
