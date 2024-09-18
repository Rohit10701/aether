import Alea from "alea";
import { createNoise3D } from "simplex-noise";
import { HEIGHT, WIDTH } from "../../utils/constant/chunk";

type NaturalBlockCharactersticsType = {
    width?: number
    height?: number
    densityThreshold?: number // range 0 - 1
} 
const prng = Alea("seed")
const noise3D = createNoise3D(prng);

export function generateNaturalBlockNoise({width = WIDTH, height = HEIGHT, densityThreshold = 0.8}
: NaturalBlockCharactersticsType){
    
    // this arry will store the density values of ore patches
    const naturalBlockPatch : boolean[][][] = []; 

    for (let voxelX = 0; voxelX < width; voxelX++) {
        naturalBlockPatch[voxelX] = [];
        for (let voxelY = 0; voxelY < height; voxelY++) {
            naturalBlockPatch[voxelX][voxelY] = [];
            for (let voxelZ = 0; voxelZ < width; voxelZ++) {
                // normalized coordinates for simplex noise
                const nx = voxelX / width - 0.5;
                const ny = voxelY / height - 0.5;
                const nz = voxelZ / width - 0.5;
                
                
                const noiseValue = noise3D(nx, ny, nz);

                // Apply threshold to determine ore presence
                if (noiseValue > densityThreshold) {
                    naturalBlockPatch[voxelX][voxelY][voxelZ] = true;
                } else {
                    naturalBlockPatch[voxelX][voxelY][voxelZ] = false;
                }
            }
        }
    }

    return naturalBlockPatch;
}