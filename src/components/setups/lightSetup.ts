import * as THREE from "three"
import { INTENSITY, AMBIENT_INTENSITY } from "../../utils/constant/lights";
type  SetupLightTypes =  {
    scene : THREE.Scene, 
    color? : number
}
export default function setupLight({scene , color = 0xFFFFFF} : SetupLightTypes){
    const intensity = 3;
    const light = new THREE.DirectionalLight( color, intensity );
    light.position.set( - 10, 20, 40 );
    scene.add( light );
}

