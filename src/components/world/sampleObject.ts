// import * as THREE from "three";
// import { generationChunkNoise } from "../../libs/noise/simplex-2d";
// import { HEIGHT, WIDTH } from "../../utils/constant/chunk";

// type createObjectsTypes = {
//     scene: THREE.Scene,
//     width?: number,
//     height?: number
// }

// export function createObjects({ scene, width = WIDTH, height = HEIGHT }: createObjectsTypes): THREE.InstancedMesh {
//     const geometry = new THREE.BoxGeometry(1, 1, 1);
//     const material = new THREE.MeshPhongMaterial({
//         color: 0x00ff00,
//         wireframe: true,
//     });
    
//     const count = width * width * height;
//     const cube = new THREE.InstancedMesh(geometry, material, count);
//     let i = 0;

//     const chunkNoiseData = generationChunkNoise();

//     for (let x = 0; x < width; x++) {
//         for (let z = 0; z < width; z++) {
//             const noiseHeight = Math.floor(chunkNoiseData[z][x] * height);

//             for (let y = 0; y < noiseHeight; y++) {
//                 const position = new THREE.Vector3(x, y, z);
//                 const matrix = new THREE.Matrix4().makeTranslation(position.x, position.y, position.z);
//                 cube.setMatrixAt(i, matrix);
//                 i++;
//             }
//         }
//     }

//     scene.add(cube);
//     cube.frustumCulled = true; // just for testing its false

//     return cube;
// }


