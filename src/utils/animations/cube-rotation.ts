import * as THREE from "three";

export function rotateEntity(entity: THREE.Object3D, time: number) {
  const speed = 1;
  const rotation = time * speed;
  // entity.rotation.x = rotation;
  // entity.rotation.y = rotation; //rotates on y axis
}
