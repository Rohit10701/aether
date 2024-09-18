/*

Generating chunk

Step 1

A solution is to divide the area into smaller areas. Any area that has nothing in it needs no storage. Let's use 32x32x32 areas (that's 32k) and only create an area if something is in it. We'll call one of these larger 32x32x32 areas a "chunk".

Step 2

Let's make the function that makes geometry for a chunk. Let's assume you pass in a chunk position. In other words if you want the geometry for the chunk that covers voxels (0-31x, 0-31y, 0-31z) then you'd pass in 0,0,0. For the chunk that covers voxels (32-63x, 0-31y, 0-31z) you'd pass in 1,0,0.

We need to be able to check the neighboring voxels so let's assume our class has a function getVoxel that given a voxel position returns the value of the voxel there. In other words if you pass it 35,0,0 and the chunkSize is 32 it's going to look at chunk 1,0,0 and in that chunk it will look at voxel 3,0,0. Using this function we can look at a voxel's neighboring voxels even if they happen to be in neighboring chunks.

Step 3

So using the code above we know when we need a face. Let's generate the faces.

Step 4

The code above would make basic geometry data for us. We just need to supply the getVoxel function. Let's start with just one hard coded chunk.

Step 5

This seems like it would work. Let's make a setVoxel function so we can set some data.

Step 6

make some code to fill out the first chunk with voxels.

Step 7

and some code to actually generate geometry like we covered in the article on custom BufferGeometry.

Step 8

Searching on the net I found this set of CC-BY-NC-SA licensed minecraft textures by Joshtimus. I picked a few at random and built this texture atlas.

To make things simple they are arranged a voxel type per column where the top row is the side of a voxel. The 2nd row is the top of voxel, and the 3rd row is the bottom of the voxel.

Knowing that we can add info to our VoxelWorld.faces data to specify for each face which row to use and the UVs to use for that face.

Step 9

And we can update the code to use that data. We need to know the size of a tile in the texture atlas and the dimensions of the texture.
We then need to load the texture
and pass the settings to the VoxelWorld class.

Step 10

Let's make it support more than one chunk.

To do this let's store chunks in an object using chunk ids. A chunk id will just be a chunk's coordinates separated by a comma. In other words if we ask for voxel 35,0,0 that is in chunk 1,0,0 so its id is "1,0,0".

Step 11

and now we can make setVoxel add new chunks if we try to set a voxel in a chunk that does not yet exist.

Step 12

And this below code will let us set a voxel based on where the user clicks. It uses code similar to the code we made in the article on picking but it's not using the built in RayCaster. Instead it's using VoxelWorld.intersectRay which returns the position of intersection and the normal of the face hit.
*/

/* 

ChunkSize = 16*16*16
Chunk Coordinate  = (0, 0, 0)
Voxel Coordinates = (0-15x, 0-15y, 0-15z)

Chunk Coordinate  = (1, 0, 0)
Voxel Coordinates = (16-31x, 0-15y, 0-15z)
*/

import * as THREE from 'three'

type VoxelChunkTypes = {
	chunkWidth: number
	chunkHeight: number
}

type LocalVoxelCoordinateType = {
	voxelLocalCordX: number
	voxelLocalCordY: number
	voxelLocalCordZ: number
}

type AbsoluteVoxelCoordinateType = {
	voxelAbsoluteCordX: number
	voxelAbsoluteCordY: number
	voxelAbsoluteCordZ: number
}

export class VoxelChunk {
	chunkWidth: number
	chunkHeight: number
	chunkData: Uint8Array // Store multiple chunks based on their chunk ids

	constructor({ chunkWidth, chunkHeight }: VoxelChunkTypes) {
		this.chunkWidth = chunkWidth
		this.chunkHeight = chunkHeight
		this.chunkData = new Uint8Array(this.chunkWidth * this.chunkHeight * this.chunkWidth) // use to store info of each chunk voxel with their coordinates as keys
	}

	// Get the chunk data for the given voxel absolute coordinates
	getChunkDataForVoxel({
		voxelAbsoluteCordX,
		voxelAbsoluteCordY,
		voxelAbsoluteCordZ
	}: AbsoluteVoxelCoordinateType) {
		const chunkX = Math.floor(voxelAbsoluteCordX / this.chunkWidth)
		const chunkY = Math.floor(voxelAbsoluteCordY / this.chunkHeight)
		const chunkZ = Math.floor(voxelAbsoluteCordZ / this.chunkWidth)

		if (chunkX != 0 || chunkY != 0 || chunkZ != 0) {
			return null
		}

		return this.chunkData
	}

	isVoxelOnChunkBorder({
		voxelLocalCordX,
		voxelLocalCordY,
		voxelLocalCordZ
	}: LocalVoxelCoordinateType): boolean {
		if (
			voxelLocalCordX == 0 ||
			voxelLocalCordX == this.chunkWidth - 1 ||
			voxelLocalCordY == 0 ||
			voxelLocalCordY == this.chunkHeight - 1 ||
			voxelLocalCordZ == 0 ||
			voxelLocalCordZ == this.chunkWidth - 1
		) {
			return true
		}
		return false
	}

	// check if voxel is in chunk or not based on its local chunk coordinates
	getVoxel({
		voxelLocalCordX,
		voxelLocalCordY,
		voxelLocalCordZ
	}: LocalVoxelCoordinateType) {
		if (
			voxelLocalCordX < 0 ||
			voxelLocalCordX > this.chunkWidth - 1 ||
			voxelLocalCordY < 0 ||
			voxelLocalCordY > this.chunkHeight - 1 ||
			voxelLocalCordZ < 0 ||
			voxelLocalCordZ > this.chunkWidth - 1
		) {
			return false
		}
		const voxelOffset =
			voxelLocalCordY * this.chunkWidth * this.chunkWidth +
			voxelLocalCordZ * this.chunkWidth +
			voxelLocalCordX
		return this.chunkData[voxelOffset]
	}

	// Generate geometry data for the current voxel
	generateVoxelProperty() {
		const localVoxelCoordinates = [] // voxel coordinates local to beginning of current chunk
		const normals = []
		const facesVertixPosition = []
		const uvs = []
		const voxelTypes = []

		for (let voxelY = 0; voxelY < this.chunkHeight; voxelY++) {
			for (let voxelZ = 0; voxelZ < this.chunkWidth; voxelZ++) {
				for (let voxelX = 0; voxelX < this.chunkWidth; voxelX++) {
					// voxelX, voxelY, voxelZ are absolute coordinates of individual voxel
					const voxel = this.getVoxel({
						voxelLocalCordX: voxelX,
						voxelLocalCordY: voxelY,
						voxelLocalCordZ: voxelZ
					})
					if (voxel) {
						for (const { normal, vertexPosition, uv } of this.faces) {
							const neighboringVoxel = this.getVoxel({
								voxelLocalCordX: voxelX + normal[0],
								voxelLocalCordY: voxelY + normal[1],
								voxelLocalCordZ: voxelZ + normal[2]
							})

							const isVoxelOnChunkBorder = this.isVoxelOnChunkBorder({
								voxelLocalCordX: voxelX + normal[0],
								voxelLocalCordY: voxelY + normal[1],
								voxelLocalCordZ: voxelZ + normal[2]
							})
							if (!neighboringVoxel || neighboringVoxel != voxel) {
								// since this normal has no neighbour, we need to create a face to render
								const ndx = localVoxelCoordinates.length / 3
								for (const pos of vertexPosition) {
									localVoxelCoordinates.push(pos[0] + voxelX, pos[1] + voxelY, pos[2] + voxelZ)
									normals.push(...normal)
								}
								for (const uvCord of uv) {
									uvs.push(...uvCord)
								}

								const voxelOffset =
									voxelY * this.chunkWidth * this.chunkWidth + voxelZ * this.chunkWidth + voxelX
								voxelTypes.push(this.chunkData[voxelOffset])
								facesVertixPosition.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3)
							}
						}
					}
				}
			}
		}
		return {
			localVoxelCoordinates,
			normals,
			facesVertixPosition,
			uvs,
			voxelTypes
		}
	}

	// Set a voxel's value in chunk
	setVoxel(
		{ voxelLocalCordX, voxelLocalCordY, voxelLocalCordZ }: LocalVoxelCoordinateType,
		value: number
	) {
		const voxelX = THREE.MathUtils.euclideanModulo(voxelLocalCordX, this.chunkWidth) | 0
		const voxelY = THREE.MathUtils.euclideanModulo(voxelLocalCordY, this.chunkHeight) | 0
		const voxelZ = THREE.MathUtils.euclideanModulo(voxelLocalCordZ, this.chunkWidth) | 0

		const voxelOffset =
			voxelY * this.chunkWidth * this.chunkWidth + voxelZ * this.chunkWidth + voxelX
		this.chunkData[voxelOffset] = value
	}

	// Face data and normals for voxel faces
	faces = [
		{
			// Front face (Z = 1)
			normal: [0, 0, 1],
			vertexPosition: [
				[0, 0, 1], // Bottom-left
				[1, 0, 1], // Bottom-right
				[0, 1, 1], // Top-left
				[1, 1, 1] // Top-right
			],
			uv: [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1]
			]
		},
		{
			// Right face (X = 1)
			normal: [1, 0, 0],
			vertexPosition: [
				[1, 0, 1], // Bottom-right
				[1, 0, 0], // Bottom-left
				[1, 1, 1], // Top-right
				[1, 1, 0] // Top-left
			],
			uv: [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1]
			]
		},
		{
			// Back face (Z = -1)
			normal: [0, 0, -1],
			vertexPosition: [
				[1, 0, 0], // Bottom-left
				[0, 0, 0], // Bottom-right
				[1, 1, 0], // Top-left
				[0, 1, 0] // Top-right
			],
			uv: [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1]
			]
		},
		{
			// Left face (X = 0)
			normal: [-1, 0, 0],
			vertexPosition: [
				[0, 0, 0], // Bottom-left
				[0, 0, 1], // Bottom-right
				[0, 1, 0], // Top-left
				[0, 1, 1] // Top-right
			],
			uv: [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1]
			]
		},
		{
			// Top face (Y = 1)
			normal: [0, 1, 0],
			vertexPosition: [
				[0, 1, 1], // Bottom-left
				[1, 1, 1], // Bottom-right
				[0, 1, 0], // Top-left
				[1, 1, 0] // Top-right
			],
			uv: [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1]
			]
		},
		{
			// Bottom face (Y = 0)
			normal: [0, -1, 0],
			vertexPosition: [
				[0, 0, 0], // Bottom-left
				[1, 0, 0], // Bottom-right
				[0, 0, 1], // Top-left
				[1, 0, 1] // Top-right
			],
			uv: [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1]
			]
		}
	]
}
