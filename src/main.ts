import * as THREE from "three";
import { setupRenderer } from "./components/setups/rendererSetup";
import { setupScene } from "./components/setups/sceneSetup";
import { setupCamera } from "./components/setups/cameraSetup";
import { handleResize } from "./utils/resize-handler";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import setupLight from "./components/setups/lightSetup";
import { createObjects } from "./components/world/chunk";
import { Player } from "./game/player";

const canvas = document.getElementById('__canvas') as HTMLCanvasElement;

if(!canvas){
  throw new Error("Canvas has not been setup under id '__canvas', Setup to Continue... ");
}

const stats = new Stats();
const renderer = setupRenderer(canvas);
const scene = setupScene();
scene.background = new THREE.Color( 'lightblue' );
const camera = setupCamera();
setupLight({scene});

const player = new Player({scene, camera, renderer })

createObjects({scene});

// const controls = new OrbitControls( camera, renderer.domElement );

window.addEventListener('resize', () => handleResize(renderer, camera));
document.body.append(stats.dom);

// controls.update();

function animate() {
  player.update()
    requestAnimationFrame(animate);
    // controls.update();
    renderer.render(scene, camera);
    stats.update();
}

animate();
