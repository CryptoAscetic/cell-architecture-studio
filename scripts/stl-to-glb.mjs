// 把 public/models 下的二进制 STL 预转换为量化压缩 GLB。
// weld 去重顶点 + simplify 适度减面 + quantize 量化（three 原生支持 KHR_mesh_quantization，
// 运行时无需额外解码器），大幅降低体积与解析耗时。
//
// 用法：node scripts/stl-to-glb.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from "@gltf-transform/extensions";
import { simplify, quantize } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import { STLLoader, mergeVertices } from "three-stdlib";

const here = dirname(fileURLToPath(import.meta.url));
const modelsDir = join(here, "..", "public", "models");
const loader = new STLLoader();
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);

await MeshoptSimplifier.ready;

const files = readdirSync(modelsDir).filter((f) => f.toLowerCase().endsWith(".stl"));
if (files.length === 0) {
  console.log("没有找到 STL 文件，跳过。");
}

for (const file of files) {
  const stlPath = join(modelsDir, file);
  const glbPath = stlPath.replace(/\.stl$/i, ".glb");
  const buffer = readFileSync(stlPath);
  // STLLoader.parse 需要 ArrayBuffer
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const raw = loader.parse(ab);
  if (!raw.getAttribute("position")) {
    console.warn(`${file}: 无 position 属性，跳过`);
    continue;
  }

  // STL 自带的是逐面法线（共享顶点处法线不同），会阻止顶点合并。
  // 先删除法线、按位置合并顶点（索引化去重），再重算平滑法线。
  raw.deleteAttribute("normal");
  raw.deleteAttribute("uv");
  const geometry = mergeVertices(raw);
  geometry.computeVertexNormals();

  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const index = geometry.getIndex();

  const doc = new Document();
  const gltfBuffer = doc.createBuffer();
  const prim = doc.createPrimitive();

  prim.setAttribute(
    "POSITION",
    doc.createAccessor().setType("VEC3").setArray(Float32Array.from(position.array)).setBuffer(gltfBuffer),
  );
  prim.setAttribute(
    "NORMAL",
    doc.createAccessor().setType("VEC3").setArray(Float32Array.from(normal.array)).setBuffer(gltfBuffer),
  );
  if (index) {
    prim.setIndices(
      doc.createAccessor().setType("SCALAR").setArray(Uint32Array.from(index.array)).setBuffer(gltfBuffer),
    );
  }

  const mesh = doc.createMesh().addPrimitive(prim);
  const node = doc.createNode().setMesh(mesh);
  doc.createScene().addChild(node);

  await doc.transform(
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.4, error: 0.01 }),
    quantize({ quantizePosition: 14, quantizeNormal: 10 }),
  );

  await io.write(glbPath, doc);

  const before = statSync(stlPath).size;
  const after = statSync(glbPath).size;
  console.log(
    `${file} -> ${file.replace(/\.stl$/i, ".glb")}  ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(2)}MB`,
  );
}

console.log("完成。");
