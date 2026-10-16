// Typed view of curriculumData.json. TypeScript infers loose types from JSON (for example
// `kind: string`), so the cast lives here once instead of in every screen.
import raw from './curriculumData.json';
import type { JDLine, Phase } from '../types';

export const phases = raw.phases as unknown as Phase[];
export const jdLines = raw.jdLines as unknown as JDLine[];
