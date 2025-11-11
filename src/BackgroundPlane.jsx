import * as THREE from "three";

export default function BackgroundPlane({ texture, ...props }) {
    const scale = [5, 5];

    //image was flipped and upside-down
    texture.flipY = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.needsUpdate = true;

    return (
        <mesh rotation={[-Math.PI / 2, 0, Math.PI]} position={[0, -0.001, 0]} {...props}>
            <planeGeometry args={[scale[0], scale[1]]} />
            <meshBasicMaterial map={texture} />
        </mesh>
    );
}
