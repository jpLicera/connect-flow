export type PathDrawingParameters = {
	//x and y coordinates of the start and end points
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	// delta x and y
	dx: number;
	dy: number;
	adx: number;
	ady: number;
	// arbitrary offset
	o: number;
}
