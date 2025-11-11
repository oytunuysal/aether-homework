import { useMemo } from "react";
import * as THREE from "three";
import { createRoofPoints, createWalls, createRoof, applyRoofTransform } from "./helpers";

export default function BuildingMesh({ points, height, pitch, azimuth }) {
    console.log(points);

    const groundPoints = useMemo(() => {
        return points.map(p => new THREE.Vector3(p.x, 0, p.z));
    }, [points]);

    const { roofGroup, walls, roof } = useMemo(() => {
        if (groundPoints.length < 3) return {};

        let roofPoints = createRoofPoints(groundPoints, height);

        roofPoints = applyRoofTransform(roofPoints, pitch, azimuth);

        const wallsMeshGroup = createWalls(groundPoints, roofPoints);
        const roofMesh = createRoof(roofPoints);
        roofMesh.position.setY(height)

        const roofGroup = new THREE.Group();
        roofGroup.add(roofMesh);

        return { roofGroup, walls: wallsMeshGroup, roof: roofMesh };
    }, [groundPoints, height, pitch, azimuth]);

    if (!roofGroup || !walls) return null;

    return (
        <group>
            <primitive object={walls} />
            <primitive object={roofGroup} />
        </group>
    );
}
