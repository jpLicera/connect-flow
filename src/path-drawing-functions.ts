import { PathDrawingParameters } from "./types/PathDrawingParameters";

export const path_drawing_functions = {

	//TODO: replace these, which are cases where taking the dimensions of the start/end shapes is strictly necessary
	tbd: () => ``,

	// straight line
	p0: () => ``,

	p1: (p: PathDrawingParameters) => `L ${p.x2} ${p.y1}`,

	p2: (p: PathDrawingParameters) => `L ${p.x1} ${p.y2}`,

	p3: (p: PathDrawingParameters) => `L ${p.x1 + p.adx / 2} ${p.y1} L ${p.x1 + p.adx / 2} ${p.y2}`,
	m_p3: (p: PathDrawingParameters) => `L ${p.x1 - p.adx / 2} ${p.y1} L ${p.x1 - p.adx / 2} ${p.y2}`,

	p4: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x2} ${p.y1 + p.o1}`,
	p5: (p: PathDrawingParameters) => `L ${p.x1 + p.o1} ${p.y1} L ${p.x1 + p.o1} ${p.y1 + p.o2} L ${p.x2} ${p.y2 + p.o2}`,

	p6: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x1 - p.adx / 2} ${p.y1 + p.o1} L ${p.x1 - p.adx / 2} ${p.y2 + p.o2} L ${p.x2} ${p.y2 + p.o2}`,
	m_p6: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x1 + p.adx / 2} ${p.y1 + p.o1} L ${p.x1 + p.adx / 2} ${p.y2 + p.o2} L ${p.x2} ${p.y2 + p.o2}`,

	p7: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x1 - p.adx / 2} ${p.y1 + p.o1} L ${p.x1 - p.adx / 2} ${p.y2}`,
	m_p7: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x1 + p.adx / 2} ${p.y1 + p.o1} L ${p.x1 + p.adx / 2} ${p.y2}`,

	p8: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x2 + p.o2} ${p.y1 + p.o1} L ${p.x2 + p.o2} ${p.y2} L ${p.x2 + p.o2} ${p.y2}`,

	p9: (p: PathDrawingParameters) => `L ${p.x1 + p.o1} ${p.y1} L ${p.x1 + p.o1} ${p.y2 + p.o2} L ${p.x2} ${p.y2 + p.o2}`,

	p10: (p: PathDrawingParameters) => `L ${p.x1 + p.o1} ${p.y1} L ${p.x1 + p.o1} ${p.y2}`,

	p11: (p: PathDrawingParameters) => `L ${p.x1 + p.o1} ${p.y1} L ${p.x1 + p.o1} ${p.y1 + p.ady / 2} L ${p.x2 + p.o2} ${p.y1 + p.ady / 2} L ${p.x2 + p.o2} ${p.y2}`,
	i_p11: (p: PathDrawingParameters) => `L ${p.x1 + p.o1} ${p.y1} L ${p.x1 + p.o1} ${p.y1 - p.ady / 2} L ${p.x2 + p.o2} ${p.y1 - p.ady / 2} L ${p.x2 + p.o2} ${p.y2}`,

	p12: (p: PathDrawingParameters) => `L ${p.x1} ${p.y2 + p.o2} L ${p.x2} ${p.y2 + p.o2}`,

	p13: (p: PathDrawingParameters) => `L ${p.x2 + p.o2} ${p.y1} L ${p.x2 + p.o2} ${p.y2}`,

	p14: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x2 + p.o2} ${p.y1 + p.o1} L ${p.x2 + p.o2} ${p.y2}`,

	p15: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o1} L ${p.x1 + p.o2} ${p.y1 + p.o1} L ${p.x2 + p.o2} ${p.y2}`,

	p16: (p: PathDrawingParameters) => `L ${p.x1 + p.o1} ${p.y1} L ${p.x1 + p.o1} ${p.y1 + p.dy / 2} L ${p.x2 + p.o2} ${p.y1 + p.dy / 2} L ${p.x2 + p.o2} ${p.y1 + p.dy / 2} L ${p.x2 + p.o2} ${p.y2}`,
}
