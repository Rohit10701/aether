import * as THREE from "three"

export function setupRenderer(canvas : HTMLElement) {
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}
