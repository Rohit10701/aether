import { event } from '@tauri-apps/api'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

export class Player {
	private scene: THREE.Scene
	private camera: THREE.PerspectiveCamera
	private orbitControls: OrbitControls
	private pointerControls: PointerLockControls
	private renderer: THREE.WebGLRenderer

	private moveForward = false
	private moveBackward = false
	private moveLeft = false
	private moveRight = false
	private canJump = false
	private velocity = new THREE.Vector3()
	private direction = new THREE.Vector3()
	private isOrbitControlsActive = false
	private rotationX = 0
	private rotationY = 0

	constructor({
		scene,
		camera,
		renderer
	}: {
		scene: THREE.Scene
		camera: THREE.PerspectiveCamera
		renderer: THREE.WebGLRenderer
	}) {
		this.scene = scene
		this.camera = camera
		this.renderer = renderer

		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
		this.orbitControls.enabled = false

		this.pointerControls = new PointerLockControls(this.camera, document.body)
		this.scene.add(this.pointerControls.object)

		this.setupPointerLock()
		this.setupEventListeners()
	}

	private setupPointerLock(): void {
		const instructions = document.getElementById('instructions')!
		instructions.addEventListener('click', () => this.pointerControls.lock())

		this.pointerControls.addEventListener('lock', () => {
			instructions.style.display = 'none'
		})

		this.pointerControls.addEventListener('unlock', () => {
			instructions.style.display = ''
		})
	}

	private setupEventListeners(): void {
		document.addEventListener('keydown', (event) => this.onKeyDown(event))
		document.addEventListener('keyup', (event) => this.onKeyUp(event))
		document.addEventListener('mousemove', (event) => this.onMouseMove(event))
	}

	private onKeyDown(event: KeyboardEvent): void {
		if (this.isOrbitControlsActive && event.code !== 'F5') return

		switch (event.code) {
			case 'ArrowUp':
			case 'KeyW':
				this.moveForward = true
				break
			case 'ArrowLeft':
			case 'KeyA':
				this.moveLeft = true
				break
			case 'ArrowDown':
			case 'KeyS':
				this.moveBackward = true
				break
			case 'ArrowRight':
			case 'KeyD':
				this.moveRight = true
				break
			case 'Space':
				if (this.canJump) this.velocity.y += 100
				this.canJump = false
				break
			default:
				break
		}
	}

	private onKeyUp(event: KeyboardEvent): void {
		if (this.isOrbitControlsActive) return

		switch (event.code) {
			case 'ArrowUp':
			case 'KeyW':
				this.moveForward = false
				break
			case 'ArrowLeft':
			case 'KeyA':
				this.moveLeft = false
				break
			case 'ArrowDown':
			case 'KeyS':
				this.moveBackward = false
				break
			case 'ArrowRight':
			case 'KeyD':
				this.moveRight = false
				break
			default:
				break
		}
	}

	private onMouseMove(event: MouseEvent): void {
		// if (this.pointerControls.isLocked === true) {
		const movementX = event.movementX || 0
		const movementY = event.movementY || 0

		this.rotationX -= movementY * 0.005 // Sensitivity
		this.rotationY -= movementX * 0.005

		// Constrain vertical rotation
		this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX))
		console.log(this.rotationX, this.rotationY)

		// Apply rotation
		this.camera.rotation.x = this.rotationX
		this.camera.rotation.y = this.rotationY
		// }
	}

	private updateMovement(delta: number): void {
		this.velocity.x -= this.velocity.x * 10.0 * delta // 10 is multipler for deacceleration factor delta
		this.velocity.z -= this.velocity.z * 10.0 * delta
		this.velocity.y -= 9.8 * 100.0 * delta // 100x earth gravity

		this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
		this.direction.x = Number(this.moveRight) - Number(this.moveLeft)
		this.direction.normalize() // to have unit vector

		if (this.moveForward || this.moveBackward) {
			this.velocity.z -= this.direction.z * 400.0 * delta
		}

		if (this.moveLeft || this.moveRight) {
			this.velocity.x -= this.direction.x * 400.0 * delta
		}

		this.pointerControls.moveRight(-this.velocity.x * delta)
		this.pointerControls.moveForward(-this.velocity.z * delta)

		this.pointerControls.object.position.y += this.velocity.y * delta
		if (this.pointerControls.object.position.y < 10) {
			this.velocity.y = 0
			this.pointerControls.object.position.y = 10
			this.canJump = true
		}
	}

	public update(): void {
		const delta = 0.016 // 1/60fps = 0.01667
		this.renderer.render(this.scene, this.camera)

		if (this.isOrbitControlsActive) {
			this.orbitControls.update()
			return
		}

		this.updateMovement(delta)
	}
}
