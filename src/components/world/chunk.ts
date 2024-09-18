import * as THREE from 'three'
import { generateChunkNoise } from '../../libs/noise/terrain'
import { HEIGHT, WIDTH } from '../../utils/constant/chunk'
import { VoxelChunk } from '../../game/voxelChunk'
import { generateNaturalBlockNoise } from '../../libs/noise/block'

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
	const chunkNoiseData = generateChunkNoise()
	const stoneNoiseData = generateNaturalBlockNoise({})

	createChunkWithNoise(chunkNoiseData, voxelChunk) // default block is stone with id = 1
	createBlockWithNoise(stoneNoiseData, voxelChunk, 2)
	// console.log(voxelChunk.chunkData.filter(data => data ==2 ))
	// Generate voxel geometry based on the voxel data
	const voxelGeometry = voxelChunk.generateVoxelProperty()

	// Create voxel mesh with different textures
	const voxelMesh = createVoxelMesh(voxelGeometry)
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
) {
	const { localVoxelCoordinates, normals, facesVertixPosition, uvs, voxelTypes } = voxelGeometry

	const geometry = new THREE.BufferGeometry()

	const vertices = new Float32Array(localVoxelCoordinates)
	const indices = new Uint16Array(facesVertixPosition)

	geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
	geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
	geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
	geometry.setIndex(new THREE.BufferAttribute(indices, 1))

	// Create a mesh for each voxel, applying the correct texture based on voxel type
	const mesh = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial({
			color: 0x00ff00,
			// wireframe: true
		})
	)

	return mesh
}


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