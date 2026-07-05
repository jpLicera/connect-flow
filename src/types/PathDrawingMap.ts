import { AlignmentPair } from "./AlignmentPair";
import { PathDrawingFunction } from "./PathDrawingFunction";
import { SidePair } from "./ShapeSidePair";

export type PathDrawingMap = {
	[key in AlignmentPair]: {
		[key in SidePair]: PathDrawingFunction
	}
}
