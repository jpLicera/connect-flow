import { AlignmentPair } from "./AlignmentPair";
import { PathDrawingFunction } from "./PathDrawingFunction";
import { SidePair } from "./ShapeSidePair";

export type PathMap = {
	[key in AlignmentPair]: {
		[key in SidePair]: PathDrawingFunction
	}
}

