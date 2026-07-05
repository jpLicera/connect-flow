import { HorizontalAlignment } from "./HorizontalAlignment";
import { VerticalAlignment } from "./VerticalAlignment";

export type AlignmentPair = Exclude<`${HorizontalAlignment}${VerticalAlignment}`, "cc">
