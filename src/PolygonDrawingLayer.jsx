import { useState, useCallback } from "react";
import BackgroundPlane from "./BackgroundPlane";
import * as THREE from "three";
import { Line } from "@react-three/drei";


export default function PolygonDrawingLayer({ texture, onPointsChange, isDrawingMode }) {
    const [points, setPoints] = useState([]);
    const [hover, setHover] = useState(null);

    const CLOSE_DISTANCE = 0.4;

    const onPointerMove = useCallback((e) => {
        if (!isDrawingMode) return;
        const point = e.point.clone();
        point.y = 0;
        setHover(point);
    }, [isDrawingMode]);

    const onPointerDown = useCallback(
        (e) => {
            if (!isDrawingMode) return;
            e.stopPropagation();

            const point = e.point.clone();
            point.y = 0;

            setPoints((prev) => {
                if (prev.length >= 3) {
                    const first = prev[0];
                    const dist = point.distanceTo(first);

                    if (dist < CLOSE_DISTANCE) {
                        const closedPoints = [...prev, first.clone()];
                        const shapePoints = prev.map((v) => new THREE.Vector2(v.x, v.z));
                        const shape = new THREE.Shape(shapePoints);

                        onPointsChange?.({
                            points: closedPoints,
                            shape
                        });

                        setHover(null);
                        return closedPoints;
                    }
                }

                const next = [...prev, point];
                onPointsChange?.({
                    points: next,
                    shape: null 
                });
                return next;
            });
        },
        [onPointsChange, isDrawingMode]
    );

    const drawnLine = points.map((p) => new THREE.Vector3(p.x, p.y, p.z))
    const previewLine = hover
        ? [...points, hover].map((p) => new THREE.Vector3(p.x, p.y, p.z))
        : drawnLine;

    return (
        <>
            {texture && (
                <BackgroundPlane
                    name="bg-plane"
                    texture={texture}
                    onPointerMove={isDrawingMode ? onPointerMove : undefined}
                    onPointerDown={isDrawingMode ? onPointerDown : undefined}

                />
            )}
            {points.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.125, 8, 8]} />
                    <meshBasicMaterial color="orange" />
                </mesh>
            ))}
            {isDrawingMode && hover && (
                <mesh position={hover}>
                    <sphereGeometry args={[0.09, 8, 8]} />
                    <meshBasicMaterial wireframe />
                </mesh>
            )}
            {isDrawingMode ? (
                previewLine.length > 1 && (
                    <Line points={previewLine} color="yellow" lineWidth={2} />
                )
            ) : (
                drawnLine.length > 1 && (
                    <Line points={drawnLine} color="yellow" lineWidth={2} />
                )
            )}
        </>
    );
}
