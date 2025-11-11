import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { fetchMapTexture } from "./fetchSatellite";
import PolygonDrawingLayer from "./PolygonDrawingLayer";
import BuildingMesh from "./BuildingMesh";
import * as THREE from "three";

export default function App() {
  const [texture, setTexture] = useState(null);
  const [tool, setTool] = useState("orbit");
  const [polygonData, setPolygonData] = useState(null);
  const [height, setHeight] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [azimuth, setAzimuth] = useState(0);

  const [lat, setLat] = useState(36.862747);
  const [lng, setLng] = useState(30.638506);
  const [zoom, setZoom] = useState(20);

  const loadTexture = async () => {
    const tex = await fetchMapTexture(lat, lng, zoom, import.meta.env.VITE_GOOGLE_MAPS_KEY);
    setTexture(tex);
  };

  useEffect(() => {
    loadTexture();
  }, []);

  return (
    <>
      <Canvas camera={{ position: [0, 5, 5] }}>
        <ambientLight intensity={0.3} />
        <directionalLight intensity={0.7} position={[5, 5, 5]} />

        <OrbitControls enabled={tool !== "draw"} makeDefault enablePan={false} />
        <gridHelper position={[0, -0.0001, 0]} />
        {/* <axesHelper args={[5]} /> */}
        <PolygonDrawingLayer
          texture={texture}
          isDrawingMode={(tool === "draw")}
          onPointsChange={(data) => {
            setPolygonData(data);
            if (data.shape) {
              setTool("orbit");
            }
          }}
        />
        {polygonData?.shape && (
          <BuildingMesh
            points={polygonData.points}
            height={height}
            pitch={pitch}
            azimuth={azimuth}
          />
        )}

        <Html fullscreen>
          <div className="ui-panel">

            {/* Map Controls */}
            <div className="controls">
              <div className="control-group">
                <label>Latitude</label>
                <input type="number" step="0.000001" value={lat} onChange={(e) => setLat(+e.target.value)} />
              </div>

              <div className="control-group">
                <label>Longitude</label>
                <input type="number" step="0.000001" value={lng} onChange={(e) => setLng(+e.target.value)} />
              </div>

              <div className="control-group">
                <label>Zoom</label>
                <input type="number" value={zoom} onChange={(e) => setZoom(+e.target.value)} />
              </div>

              <button className="primary" onClick={loadTexture}>Get Map</button>
            </div>

            <div className="toolbar">
              <button onClick={() => setTool("draw")}>Draw</button>
              <button onClick={() => setTool("orbit")}>Orbit</button>
            </div>

            {polygonData?.shape && (
              <div className="controls">
                <div className="control-group">
                  <label>Height</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(+e.target.value)}
                  />
                </div>

                <div className="control-group">
                  <label>Roof Pitch (°)</label>
                  <input
                    type="number"
                    value={THREE.MathUtils.radToDeg(pitch)}
                    onChange={(e) => setPitch(THREE.MathUtils.degToRad(+e.target.value))}
                  />
                </div>

                <div className="control-group">
                  <label>Roof Azimuth (°)</label>
                  <input
                    type="number"
                    value={THREE.MathUtils.radToDeg(azimuth)}
                    onChange={(e) => setAzimuth(THREE.MathUtils.degToRad(+e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </Html>
      </Canvas>

    </>

  )
}