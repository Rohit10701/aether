export const BlockTypeIdMapper: Record<number, string> = {
	0: 'air',
	1: 'stone',
	2: 'dirt'
}

export const BlockTextureConfig: Record<string, number[][]> = {
	//  block   : [front, back, left, right, top, bottom]
	air: [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
 	],
	stone: [
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1],
		[0, 1]
	],
	dirt: [
		[2,1],
		[2,1],
		[2,1],
		[2,1],
		[2,1],
		[2,1]
	]
}
