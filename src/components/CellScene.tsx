import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, Float, Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { Box3, Color, DoubleSide, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { cells, type CellItem, type CellModelAsset, type ViewMode } from "../data/cells";
import { assetUrl } from "../lib/assetUrl";

// 预加载全部牙弓模型，切换时即时显示（总体积较小）。
cells.forEach((cell) => {
  if (cell.modelAsset) {
    useGLTF.preload(assetUrl(cell.modelAsset.url));
  }
});

type CellSceneProps = {
  cell: CellItem;
  activeOrganelle: string;
  viewMode: ViewMode;
  crossSection: boolean;
  autoRotate: boolean;
  resetKey: number;
};

type CommonModelProps = {
  activeOrganelle: string;
  viewMode: ViewMode;
  crossSection: boolean;
};

// 目标世界尺寸：自动把任意单位的扫描模型缩放到画布中合适的大小
const TARGET_SIZE = 3.6;

function JawModel({
  cell,
  asset,
  viewMode,
  crossSection,
}: CommonModelProps & {
  cell: CellItem;
  asset: CellModelAsset;
}) {
  const { scene } = useGLTF(assetUrl(asset.url));

  const prepared = useMemo(() => {
    const exposure = asset.exposure ?? 1;
    const focus = viewMode === "focus";
    const material = new MeshStandardMaterial({
      color: new Color(cell.color),
      roughness: 0.52,
      metalness: 0.04,
      side: DoubleSide,
      transparent: crossSection || focus,
      opacity: crossSection ? 0.5 : focus ? 0.92 : 1,
      emissive: new Color(cell.accent).lerp(new Color("#ffffff"), 0.6),
      emissiveIntensity: 0.05 * exposure,
      envMapIntensity: 0.7 * exposure,
    });

    const clone = scene.clone(true);
    clone.traverse((node) => {
      const mesh = node as Mesh;
      if (mesh.isMesh) {
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, cell.color, cell.accent, asset.exposure, viewMode, crossSection]);

  const fitScale = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return (TARGET_SIZE / maxDim) * (asset.scale ?? 1);
  }, [scene, asset.scale]);

  return (
    <group
      position={asset.position ?? [0, 0, 0]}
      rotation={asset.rotation ?? [0, 0, 0]}
      scale={[fitScale, fitScale, fitScale]}
    >
      <Center>
        <primitive object={prepared} />
      </Center>
    </group>
  );
}

function CellModel({
  cell,
  viewMode,
  crossSection,
  autoRotate,
}: Omit<CellSceneProps, "resetKey" | "activeOrganelle"> & { activeOrganelle: string }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current && autoRotate) {
      group.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {cell.modelAsset && (
        <JawModel
          cell={cell}
          asset={cell.modelAsset}
          activeOrganelle={cell.defaultOrganelle}
          viewMode={viewMode}
          crossSection={crossSection}
        />
      )}
    </group>
  );
}

function ModelLoadingOverlay({ cell }: { cell: CellItem }) {
  const { progress } = useProgress();
  const displayProgress = Math.max(8, Math.min(100, Math.round(progress)));

  return (
    <Html center className="model-loader">
      <div>
        <span>正在加载 3D 模型</span>
        <strong>{cell.name}</strong>
        <i>
          <b style={{ width: `${displayProgress}%` }} />
        </i>
        <em>{displayProgress}%</em>
      </div>
    </Html>
  );
}

export function CellScene({
  cell,
  activeOrganelle,
  viewMode,
  crossSection,
  autoRotate,
  resetKey,
}: CellSceneProps) {
  return (
    <Canvas
      key={resetKey}
      className="cell-canvas is-native-asset"
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
      camera={{ position: [0, 0.2, 5.8], fov: 38 }}
    >
      <ambientLight intensity={1.4} />
      <hemisphereLight args={["#fffaf0", "#efe3d2", 1.24]} />
      <directionalLight position={[4.2, 5.2, 5.8]} intensity={2.7} castShadow />
      <directionalLight position={[-4.4, 2.2, 3.6]} intensity={0.82} color="#fff1df" />
      <spotLight
        position={[-3.6, 3.2, 4.6]}
        angle={0.42}
        penumbra={0.74}
        intensity={0.8}
        color="#fff8ec"
      />
      <pointLight position={[2.8, -1.2, 3.2]} intensity={0.46} color="#ffffff" />
      <Suspense fallback={<ModelLoadingOverlay cell={cell} />}>
        <Float speed={1.25} rotationIntensity={0.08} floatIntensity={0.18}>
          <CellModel
            cell={cell}
            activeOrganelle={activeOrganelle}
            viewMode={viewMode}
            crossSection={crossSection}
            autoRotate={autoRotate}
          />
        </Float>
        <ContactShadows position={[0, -1.8, 0]} opacity={0.18} scale={7.8} blur={3.2} far={4.2} />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        minDistance={3.2}
        maxDistance={8.4}
      />
    </Canvas>
  );
}
