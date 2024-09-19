import * as THREE from 'three'
import { generateChunkNoise } from '../../libs/noise/terrain'
import { HEIGHT, WIDTH } from '../../utils/config/chunk'
import { VoxelChunk } from '../../game/voxelChunk'
import { generateNaturalBlockNoise } from '../../libs/noise/block'
import { BlockTextureConfig, BlockTypeIdMapper } from '../../utils/config/blocks'

type createObjectsTypes = {
	scene: THREE.Scene
	width?: number
	height?: number
}

export function createObjects({ scene, width = WIDTH, height = HEIGHT }: createObjectsTypes): void {
	// Initialize VoxelChunk
	const voxelChunk = new VoxelChunk({
		chunkWidth: width,
		chunkHeight: height
	})

	// Generate chunk noise data to simulate terrain height variation
	console.time("chunkNoiseData")
	const chunkNoiseData = generateChunkNoise()
	const stoneNoiseData = generateNaturalBlockNoise({})
	console.timeEnd("chunkNoiseData")

	console.time("createChunkWithNoise")
	createChunkWithNoise(chunkNoiseData, voxelChunk) // default block is stone with id = 1
	console.timeEnd("createChunkWithNoise")

	createBlockWithNoise(stoneNoiseData, voxelChunk, 2)
	// console.log(voxelChunk.chunkData.filter(data => data ==2 ))
	// Generate voxel geometry based on the voxel dat

	console.time("voxelGeometry")
	const voxelGeometry = voxelChunk.generateVoxelProperty()
	console.timeEnd("voxelGeometry")

	// Create voxel mesh with different textures
	console.time("voxelMesh")
	const voxelMesh = createVoxelMesh(voxelGeometry, 2, 6, "/src/assets/textureAtlas.png")
	console.timeEnd("voxelMesh")

	scene.add(voxelMesh)

	// setting the frustum culling to true for optimization
	voxelMesh.frustumCulled = true
}






// Helper function to create a mesh from voxel geometry with different textures
function createVoxelMesh(
	voxelGeometry: {
		localVoxelCoordinates: number[]
		normals: number[]
		facesVertixPosition: number[]
		uvs: number[]
		voxelTypes: number[] // Array holding voxel types for each voxel
	},
	atlasRows: number,    // Number of rows in the atlas
	atlasCols: number,    // Number of columns in the atlas
	textureAtlasURL: string // URL for the texture atlas
) {
	const { localVoxelCoordinates, normals, facesVertixPosition, voxelTypes } = voxelGeometry

	const geometry = new THREE.BufferGeometry()

	const vertices = new Float32Array(localVoxelCoordinates)
	const indices = new Uint16Array(facesVertixPosition)

	geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
	geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
	geometry.setIndex(new THREE.BufferAttribute(indices, 1))

	// Load the texture atlas
	const texture = new THREE.TextureLoader().load(textureAtlasURL)
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter

	const material = new THREE.MeshStandardMaterial({
		map: texture
	})

	// Now we need to generate UVs for each face of each voxel
	const uvsArray : number[] = []

	voxelTypes.forEach((voxelType, voxelIndex) => {
		// Assuming each voxel has 6 faces (front, back, left, right, top, bottom)
		let textureAtlasCord = BlockTextureConfig[BlockTypeIdMapper[voxelType]]
		for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
			const [x, y] = textureAtlasCord[faceIndex]
			const uvForFace = getUVCoordinates(x, y, 3, 2)

			// Push the UV coordinates for this face into the uvsArray
			// We need to add UVs for 4 vertices of the face
			uvForFace.forEach(uv => {
				uvsArray.push(...uv)  // Flatten the UV array and add to uvsArray
			})
		}
	})

	// Set the UVs for the geometry
	geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvsArray), 2))

	// Create the mesh
	const mesh = new THREE.Mesh(geometry, material)

	return mesh
}


// function createVoxelMesh(
// 	voxelGeometry: {
// 		localVoxelCoordinates: number[]
// 		normals: number[]
// 		facesVertixPosition: number[]
// 		uvs: number[]
// 		voxelTypes: number[] // Array holding voxel types for each voxel
// 	},
// ) {
// 	const { localVoxelCoordinates, normals, facesVertixPosition, uvs, voxelTypes } = voxelGeometry

// 	const geometry = new THREE.BufferGeometry()

// 	const vertices = new Float32Array(localVoxelCoordinates)
// 	const indices = new Uint16Array(facesVertixPosition)

// 	geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
// 	geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
// 	geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
// 	geometry.setIndex(new THREE.BufferAttribute(indices, 1))

// 	// Create a mesh for each voxel, applying the correct texture based on voxel type
// 	const mesh = new THREE.Mesh(
// 		geometry,
// 		new THREE.MeshStandardMaterial({
// 			// color: 0x00ff00,
// 			// wireframe: true
// 			map: new THREE.TextureLoader().load("/src/assets/typescript.svg")
// 		})
// 	)

// 	return mesh
// }

// function createVoxelMesh(
// 	voxelGeometry: {
// 		localVoxelCoordinates: number[],
// 		normals: number[],
// 		facesVertixPosition: number[],
// 		uvs: number[],
// 		voxelTypes: number[]
// 	},
// 	texturesForEachFace: { [voxelType: number]: string[] }
// ) {
// 	const { localVoxelCoordinates, normals, facesVertixPosition, voxelTypes, uvs } = voxelGeometry;

// 	// Create buffer geometry
// 	const geometry = new THREE.BufferGeometry();
// 	const vertices = new Float32Array(localVoxelCoordinates);
// 	const indices = new Uint16Array(facesVertixPosition);

// 	geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
// 	geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
// 	geometry.setIndex(new THREE.BufferAttribute(indices, 1));

// 	// UV mapping (Ensure geometry has UVs if textures are involved)
// 	geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2)); // Adding UVs

// 	// Create array of materials
// 	const materials = [];
// 	const textureLoader = new THREE.TextureLoader();

// 	// Iterate over voxel types to assign textures
// 	for (let i = 0; i < voxelTypes.length; i++) {
// 		const voxelType = voxelTypes[i];
// 		const faceTextures = texturesForEachFace[voxelType];

// 		// Ensure we have textures for all 6 faces
// 		if (!faceTextures || faceTextures.length !== 6) {
// 			console.warn(`Voxel type ${voxelType} doesn't have exactly 6 textures.`);
// 			continue;
// 		}

// 		// Create materials for each face
// 		for (let face = 0; face < 6; face++) {
// 			const textureUrl = faceTextures[face];

// 			// Handle asynchronous texture loading with callbacks
// 			const material = new THREE.MeshStandardMaterial();

// 			textureLoader.load(
// 				textureUrl,
// 				(texture) => {
// 					material.map = texture;
// 					material.needsUpdate = true; // Force update once the texture is loaded
// 				},
// 				undefined,
// 				(error) => {
// 					console.error(`Error loading texture: ${textureUrl}`, error);
// 				}
// 			);

// 			// Add the material
// 			materials.push(material);
// 		}
// 	}

// 	// Assign groups for each face
// 	const facesPerVoxel = 6;
// 	const indicesPerFace = 6; // Each face is composed of 2 triangles, i.e., 6 indices
// 	for (let i = 0; i < voxelTypes.length; i++) {
// 		for (let face = 0; face < facesPerVoxel; face++) {
// 			const groupStart = (i * facesPerVoxel + face) * indicesPerFace;
// 			geometry.addGroup(groupStart, indicesPerFace, i * facesPerVoxel + face);
// 		}
// 	}

// 	// Create mesh with geometry and materials
// 	const mesh = new THREE.Mesh(geometry, materials);

// 	return mesh;
// }




// function to create a chunk with default blocks [stone]
function createChunkWithNoise(chunkNoiseData :  number[][], voxelChunk : VoxelChunk){
		// Set voxel data based on noise
		for (let x = 0; x < WIDTH; x++) {
			for (let z = 0; z < WIDTH; z++) {
				const noiseHeight = Math.floor(chunkNoiseData[z][x] * HEIGHT)
				for (let y = 0; y < noiseHeight; y++) {
					// Set voxel based on noise and block type
					voxelChunk.setVoxel(
						{
							voxelLocalCordX: x,
							voxelLocalCordY: y,
							voxelLocalCordZ: z
						},
						1 // Use blockType to determine texture later
					)
				}
			}
		}
}
 
// function to create patchs of blocks with 3d Noise
function createBlockWithNoise(naturalBlockNoiseData : boolean[][][], voxelChunk : VoxelChunk, blockProperties : any ){
	// TODO : modify blockProperties Params

	for (let x = 0; x < WIDTH; x++) {
		for (let z = 0; z < WIDTH; z++) {
			for (let y = 0; y < HEIGHT; y++) {
				// Set voxel based on noise and block type
				if(naturalBlockNoiseData[x][y][z]){
					voxelChunk.setVoxel(
						{
							voxelLocalCordX: x,
							voxelLocalCordY: y,
							voxelLocalCordZ: z
						},
						blockProperties
					)
				}
			}
		}
	}
}	


// function calculateUVsForAtlas(voxelType: number, faceIndex: number, atlasRows: number, atlasCols: number): [number, number][] {
//     // Ensure voxelType is 0-indexed
//     const adjustedVoxelType = voxelType - 1;

//     // Calculate the row and column for the given voxelType and faceIndex
//     const col = adjustedVoxelType % atlasCols;
//     const row = faceIndex + (Math.floor(adjustedVoxelType / atlasCols) * atlasRows);

//     // Calculate UV coordinates
//     const uStep = 1 / atlasCols;
//     const vStep = 1 / (atlasRows * Math.ceil(voxelType / atlasCols));

//     const u0 = col * uStep;
//     const v0 = row * vStep;
//     const u1 = u0 + uStep;
//     const v1 = v0 + vStep;

//     // Define the UV coordinates for the face
//     const uv: [number, number][] = [
// 		// x, y
// 		[0, 0],  // bottom-left
//         [0.5, 0],  // bottom-right
//         [0, 0.33],  // top-left
//         [0.5, 0.33],  // top-right
//     ];

// 	console.log({uv})
//     return uv;
// }

function getUVCoordinates(row: number, col: number, totalRows: number, totalCols: number): [number, number][] {
    // Calculate the width and height of each cell in the UV space
    const colWidth = 1 / totalCols;
    const rowHeight = 1 / totalRows;
    
    // Calculate the UV coordinates for the bottom-left and top-right corners
    const x0 = col * colWidth;             // Bottom-left x
    const x1 = (col + 1) * colWidth;       // Top-right x
    const y0 = 1 - (row + 1) * rowHeight;  // Bottom-left y (note Y is inverted in UV)
    const y1 = 1 - row * rowHeight;        // Top-right y

    // Return UV coordinates in order: bottom-left, bottom-right, top-left, top-right
    return [
        [x0, y0],  // bottom-left
        [x1, y0],  // bottom-right
        [x0, y1],  // top-left
        [x1, y1]   // top-right
    ];
}
