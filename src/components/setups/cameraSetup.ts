import * as THREE from "three"
import { PERSPECTIVE_CAMERA_FAR, PERSPECTIVE_CAMERA_FOV, PERSPECTIVE_CAMERA_NEAR } from "../../utils/config/cameras";



export function setupCamera() {
    const camera = new THREE.PerspectiveCamera(PERSPECTIVE_CAMERA_FOV, window.innerWidth / window.innerHeight, PERSPECTIVE_CAMERA_NEAR, PERSPECTIVE_CAMERA_FAR);
    camera.position.set(0, 0,30)
    return camera;
}


// x, y, z -> x-z plane is main, y is for height or depth