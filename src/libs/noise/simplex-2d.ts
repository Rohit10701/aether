import { createNoise2D } from 'simplex-noise'
import { HEIGHT, WIDTH } from '../../utils/config/chunk'
import alea from 'alea';

const prng = alea('seed');
const noise2D = createNoise2D(prng)

// Rescale from -1.0:+1.0 to 0.0:1.0
export default function simplex2DNoise(x: number, y: number) {
	return noise2D(x, y) / 2 + 0.5
}

