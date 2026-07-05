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

	p4: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x2} ${p.y1 - p.o}`,
	i_p4: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x2} ${p.y1 + p.o}`,

	p5: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y1 + p.o} L ${p.x2} ${p.y2 + p.o}`,
	i_p5: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y1 - p.o} L ${p.x2} ${p.y2 - p.o}`,
	m_p5: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y1 + p.o} L ${p.x2} ${p.y2 + p.o}`,
	i_m_p5: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y1 - p.o} L ${p.x2} ${p.y2 - p.o}`,

	p6: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x1 - p.adx / 2} ${p.y1 - p.o} L ${p.x1 - p.adx / 2} ${p.y2 + p.o} L ${p.x2} ${p.y2 + p.o}`,
	m_p6: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x1 + p.adx / 2} ${p.y1 - p.o} L ${p.x1 + p.adx / 2} ${p.y2 + p.o} L ${p.x2} ${p.y2 + p.o}`,
	i_p6: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x1 - p.adx / 2} ${p.y1 + p.o} L ${p.x1 - p.adx / 2} ${p.y2 - p.o} L ${p.x2} ${p.y2 - p.o}`,
	m_i_p6: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x1 + p.adx / 2} ${p.y1 + p.o} L ${p.x1 + p.adx / 2} ${p.y2 - p.o} L ${p.x2} ${p.y2 - p.o}`,

	p7: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x1 - p.adx / 2} ${p.y1 - p.o} L ${p.x1 - p.adx / 2} ${p.y2}`,
	m_p7: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x1 + p.adx / 2} ${p.y1 - p.o} L ${p.x1 + p.adx / 2} ${p.y2}`,
	i_p7: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x1 - p.adx / 2} ${p.y1 + p.o} L ${p.x1 - p.adx / 2} ${p.y2}`,
	i_m_p7: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x1 + p.adx / 2} ${p.y1 + p.o} L ${p.x1 + p.adx / 2} ${p.y2}`,

	p8: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x2 - p.o} ${p.y1 - p.o} L ${p.x2 - p.o} ${p.y2} L ${p.x2 - p.o} ${p.y2}`,
	i_p8: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x2 - p.o} ${p.y1 + p.o} L ${p.x2 - p.o} ${p.y2} L ${p.x2 - p.o} ${p.y2}`,
	m_p8: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x2 + p.o} ${p.y1 - p.o} L ${p.x2 + p.o} ${p.y2} L ${p.x2 + p.o} ${p.y2}`,
	i_m_p8: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x2 + p.o} ${p.y1 + p.o} L ${p.x2 + p.o} ${p.y2} L ${p.x2 + p.o} ${p.y2}`,

	p9: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y2 - p.o} L ${p.x2} ${p.y2 - p.o}`,
	m_p9: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y2 - p.o} L ${p.x2} ${p.y2 - p.o}`,
	i_p9: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y2 + p.o} L ${p.x2} ${p.y2 + p.o}`,
	i_m_p9: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y2 + p.o} L ${p.x2} ${p.y2 + p.o}`,

	p10: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y2}`,
	m_p10: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y2}`,

	p11: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y1 + p.ady / 2} L ${p.x2 - p.o} ${p.y1 + p.ady / 2} L ${p.x2 - p.o} ${p.y2}`,
	m_p11: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y1 + p.ady / 2} L ${p.x2 + p.o} ${p.y1 + p.ady / 2} L ${p.x2 + p.o} ${p.y2}`,
	i_p11: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y1 - p.ady / 2} L ${p.x2 - p.o} ${p.y1 - p.ady / 2} L ${p.x2 - p.o} ${p.y2}`,
	i_m_p11: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y1 - p.ady / 2} L ${p.x2 + p.o} ${p.y1 - p.ady / 2} L ${p.x2 + p.o} ${p.y2}`,

	p12: (p: PathDrawingParameters) => `L ${p.x1} ${p.y2 - p.o} L ${p.x2} ${p.y2 - p.o}`,
	i_p12: (p: PathDrawingParameters) => `L ${p.x1} ${p.y2 + p.o} L ${p.x2} ${p.y2 + p.o}`,

	p13: (p: PathDrawingParameters) => `L ${p.x2 - p.o} ${p.y1} L ${p.x2 - p.o} ${p.y2}`,
	m_p13: (p: PathDrawingParameters) => `L ${p.x2 + p.o} ${p.y1} L ${p.x2 + p.o} ${p.y2}`,

	p14: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x2 + p.o} ${p.y1 - p.o} L ${p.x2 + p.o} ${p.y2}`,
	m_p14: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x2 - p.o} ${p.y1 - p.o} L ${p.x2 - p.o} ${p.y2}`,
	i_p14: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x2 + p.o} ${p.y1 + p.o} L ${p.x2 + p.o} ${p.y2}`,
	i_m_p14: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x2 - p.o} ${p.y1 + p.o} L ${p.x2 - p.o} ${p.y2}`,

	p15: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x1 + p.o} ${p.y1 + p.o} L ${p.x2 + p.o} ${p.y2}`,
	i_p15: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x1 + p.o} ${p.y1 - p.o} L ${p.x2 + p.o} ${p.y2}`,
	m_p15: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 + p.o} L ${p.x1 - p.o} ${p.y1 + p.o} L ${p.x2 - p.o} ${p.y2}`,
	i_m_p15: (p: PathDrawingParameters) => `L ${p.x1} ${p.y1 - p.o} L ${p.x1 - p.o} ${p.y1 - p.o} L ${p.x2 - p.o} ${p.y2}`,

	p16: (p: PathDrawingParameters) => `L ${p.x1 - p.o} ${p.y1} L ${p.x1 - p.o} ${p.y1 + p.dy / 2} L ${p.x2 + p.o} ${p.y1 + p.dy / 2} L ${p.x2 + p.o} ${p.y1 + p.dy / 2} L ${p.x2 + p.o} ${p.y2}`,
	m_p16: (p: PathDrawingParameters) => `L ${p.x1 + p.o} ${p.y1} L ${p.x1 + p.o} ${p.y1 + p.dy / 2} L ${p.x2 - p.o} ${p.y1 + p.dy / 2} L ${p.x2 - p.o} ${p.y1 + p.dy / 2} L ${p.x2 - p.o} ${p.y2}`,
}
