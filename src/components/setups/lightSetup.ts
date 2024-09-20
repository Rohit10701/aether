import * as THREE from "three"
import { INTENSITY, AMBIENT_INTENSITY } from "../../utils/config/lights";
type  SetupLightTypes =  {
    scene : THREE.Scene, 
    color? : number
}
export default function setupLight({scene , color = 0xFFFFFF} : SetupLightTypes){
    const intensity = 3;
    const light = new THREE.AmbientLight( color, 1 );
    light.position.set(  200, 200, 200 );
    scene.add( light );
}

