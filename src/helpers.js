import * as THREE from "three";

export function createRoofPoints(groundPoints, height) {
    return groundPoints.map(p => new THREE.Vector3(p.x, height, p.z));
}

export function createWalls(groundPoints, roofPoints) {
    const wallGroup = new THREE.Group();

    for (let i = 0; i < groundPoints.length - 1; i++) {
        const g1 = groundPoints[i];
        const g2 = groundPoints[i + 1];
        const r1 = roofPoints[i];
        const r2 = roofPoints[i + 1];

        const positions = [
            g1, g2, r2,
            g1, r2, r1,
        ].flatMap(v => [v.x, v.y, v.z]);

        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

        wallGroup.add(new THREE.Mesh(
            geom,
            new THREE.MeshStandardMaterial({ color: "#d0c6b4", side: THREE.DoubleSide })
        ));
    }

    return wallGroup;
}

// export function xcreateRoof(roofPoints) {
//     const shape = new THREE.Shape(roofPoints.map(v => new THREE.Vector2(v.x, v.z)));
//     const geom = new THREE.ShapeGeometry(shape);
//     let roofMesh = new THREE.Mesh(
//         geom,
//         new THREE.MeshStandardMaterial({ color: "#b05f4e", side: THREE.DoubleSide }),
//     );
//     return roofMesh
// }

export function createRoof(roofPoints) {
    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    roofPoints.forEach(point => {
        vertices.push(point.x, point.y, point.z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    geometry.computeVertexNormals();

    const indices = [];
    for (let i = 1; i < roofPoints.length - 1; i++) {
        indices.push(0, i, i + 1);
    }
    geometry.setIndex(indices);

    // Create material and mesh
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh
}

// export function xapplyRoofTransform(roofPoints, pitch, azimuth) {
//     const group = new THREE.Group();
//     roofPoints.forEach(p => group.add(new THREE.Object3D().position.copy(p)));

//     group.rotation.x = THREE.MathUtils.degToRad(pitch);
//     group.rotation.y = THREE.MathUtils.degToRad(azimuth);

//     return group.children.map(child => child.position.clone());
// }

export function applyRoofTransform(roofPoints, pitch, azimuth) {
    if (!roofPoints?.length) return [];

    const centroid = new THREE.Vector3();
    for (const p of roofPoints) centroid.add(p);
    centroid.multiplyScalar(1 / roofPoints.length);

    // 2) build matrix: T(-c) · R_y(azimuth) · R_x(pitch) · T(c)
    const T1 = new THREE.Matrix4().makeTranslation(-centroid.x, -centroid.y, -centroid.z);
    const Rx = new THREE.Matrix4().makeRotationX(pitch);
    const Ry = new THREE.Matrix4().makeRotationY(azimuth);
    const T2 = new THREE.Matrix4().makeTranslation(centroid.x, centroid.y, centroid.z);

    const M = new THREE.Matrix4().multiplyMatrices(T2, Ry.clone().multiply(Rx).multiply(T1));

    return roofPoints.map(p => p.clone().applyMatrix4(M));
}




export function rebuildBuilding({ groundPoints, height, pitch, azimuth }) {
    let roofPoints = createRoofPoints(groundPoints, height);

    roofPoints = applyRoofTransform(roofPoints, pitch, azimuth);

    const walls = createWalls(groundPoints, roofPoints);
    const roof = createRoof(roofPoints);

    return { roofPoints, walls, roof };
}

//new approach
export function projectRoofPoints(groundPoints, height, pitch, azimuth) {
    let normalVector = roofNormalFromPitchAzimuth(pitch, azimuth)
    let planeFunction = planeFromNormalAndPoint(normalVector, new THREE.Vector3(0, height, 0))
    //to find roof points
    return groundPoints.map(p => new THREE.Vector3(p.x, yOnPlaneAtXZ(planeFunction, p.x, p.z), p.z));
}

function roofNormalFromPitchAzimuth(pitchDeg, azimuthDeg) {
    const θ = pitchDeg
    const φ = azimuthDeg
    const nx = -Math.sin(θ) * Math.cos(φ);
    const ny = Math.cos(θ);
    const nz = -Math.sin(θ) * Math.sin(φ);
    return new THREE.Vector3(nx, ny, nz);
}

function planeFromNormalAndPoint(normal, point) {
    const { x: A, y: B, z: C } = normal;
    const D = -(A * point.x + B * point.y + C * point.z);
    return { A, B, C, D };
}

function yOnPlaneAtXZ(plane, x, z) {
    const { A, B, C, D } = plane;
    return (-D - A * x - C * z) / B;
}
