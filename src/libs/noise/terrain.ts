import { HEIGHT, WIDTH } from "../../utils/config/chunk";
import simplex2DNoise from "./simplex-2d";

export function generateChunkNoise() {

    let chunkNoiseData : number[][] = []
    
    for (let y = 0; y < HEIGHT; y++) {
        chunkNoiseData[y] = []
        for (let x = 0; x < WIDTH; x++) {
            let nx = x / WIDTH - 0.5,
                ny = y / HEIGHT - 0.5
                chunkNoiseData[y][x] = simplex2DNoise(nx, ny)
        }
    }
    
    return chunkNoiseData;
}