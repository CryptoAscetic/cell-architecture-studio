export type ModelKind = "upperJaw" | "lowerJaw";

export type ViewMode = "mesh" | "focus";

export type OrganelleItem = {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  attributes: Array<{
    label: string;
    value: string;
  }>;
  note: string;
  fact: string;
};

export type CellModelAsset = {
  url: string;
  format?: "stl" | "glb";
  previewUrl?: string;
  sourceLabel: string;
  sourceUrl: string;
  /** Fine-tune multiplier applied on top of the auto-fit scale. Defaults to 1. */
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  exposure?: number;
  materialMode?: "studio" | "native";
};

export type CellRenderImage = {
  url: string;
  aspect: "square" | "wide" | "landscape";
};

export type CellItem = {
  id: string;
  name: string;
  type: string;
  accent: string;
  accentSoft: string;
  color: string;
  modelKind: ModelKind;
  defaultOrganelle: string;
  comparison: string;
  modelAsset?: CellModelAsset;
  renderImage?: CellRenderImage;
  occurrence: {
    title: string;
    body: string;
    motif: string;
  };
  microscope: Array<{
    label: string;
    tone: string;
    pattern: string;
  }>;
  organelles: OrganelleItem[];
};

// 牙弓分区（沿用细胞器字段结构，作为牙位信息分区）
function arch(side: "upper" | "lower"): OrganelleItem[] {
  const seat = side === "upper" ? "上颌" : "下颌";
  return [
    {
      id: "incisors",
      name: "切牙",
      subtitle: "牙弓前段",
      color: "#5b8def",
      attributes: [
        { label: "数量", value: "4 颗（中切牙·侧切牙）" },
        { label: "位置", value: `${seat}前牙区` },
        { label: "功能", value: "切断食物·美学" },
      ],
      note: `切牙位于${seat}牙弓最前方，是排牙时确定中线与微笑曲线的关键参照。`,
      fact: "中切牙的近远中宽度常用于评估牙弓前段的拥挤或散在间隙。",
    },
    {
      id: "canines",
      name: "尖牙",
      subtitle: "牙弓转角",
      color: "#4fb6a8",
      attributes: [
        { label: "数量", value: "2 颗" },
        { label: "位置", value: `${seat}牙弓转折处` },
        { label: "功能", value: "撕裂食物·引导咬合" },
      ],
      note: "尖牙是牙弓由前牙段过渡到后牙段的转角，牙根最长，承担尖牙引导。",
      fact: "尖牙引导是排牙与咬合设计中保护后牙的重要机制。",
    },
    {
      id: "premolars",
      name: "前磨牙",
      subtitle: "牙弓中段",
      color: "#e0a76b",
      attributes: [
        { label: "数量", value: "4 颗" },
        { label: "位置", value: `${seat}后牙区前部` },
        { label: "功能", value: "辅助咀嚼·支撑面部" },
      ],
      note: "前磨牙连接尖牙与磨牙，排牙时影响牙弓宽度与颊侧丰满度。",
      fact: "正畸减数常优先考虑第一前磨牙以缓解拥挤。",
    },
    {
      id: "molars",
      name: "磨牙",
      subtitle: "牙弓后段",
      color: "#c77ad6",
      attributes: [
        { label: "数量", value: "4–6 颗" },
        { label: "位置", value: `${seat}后牙区` },
        { label: "功能", value: "研磨食物·稳定咬合" },
      ],
      note: "磨牙提供主要咀嚼力，第一磨牙的咬合关系是排牙咬合配准的基准。",
      fact: "第一磨牙常被称为「咬合的钥匙」，决定整体咬合分类。",
    },
  ];
}

function scanViews(): CellItem["microscope"] {
  return [
    { label: "口内扫描", tone: "#bcd3f2", pattern: "electron" },
    { label: "CBCT 切面", tone: "#a9d8cf", pattern: "electron" },
    { label: "石膏模型", tone: "#d9c3ec", pattern: "electron" },
  ];
}

export const cells: CellItem[] = [
  {
    id: "upper-1291",
    name: "上颌 1291",
    type: "上颌牙弓扫描",
    accent: "#4f7fd6",
    accentSoft: "#e3ecfb",
    color: "#e9e3d6",
    modelKind: "upperJaw",
    defaultOrganelle: "incisors",
    comparison: "lower-1050",
    modelAsset: {
      url: "/models/upper-1291.glb",
      format: "glb",
      sourceLabel: "口内扫描 · UpperJaw 1291 (2025-05-09)",
      sourceUrl: "local:/Desktop/model/1291_21829_2025-05-09-UpperJaw.stl",
      scale: 1,
      rotation: [-1.18, 0, 0],
      exposure: 1.05,
      materialMode: "native",
    },
    occurrence: {
      title: "上颌牙弓",
      body: "上颌牙弓承托上排牙列，是排牙设计中中线、微笑曲线与咬合平面的主要参照。",
      motif: "jaw",
    },
    microscope: scanViews(),
    organelles: arch("upper"),
  },
  {
    id: "lower-1050",
    name: "下颌 1050",
    type: "下颌牙弓扫描",
    accent: "#3f9d8c",
    accentSoft: "#dcf0eb",
    color: "#ece6d9",
    modelKind: "lowerJaw",
    defaultOrganelle: "incisors",
    comparison: "upper-1291",
    modelAsset: {
      url: "/models/lower-1050.glb",
      format: "glb",
      sourceLabel: "口内扫描 · LowerJaw 1050 (2025-02-20)",
      sourceUrl: "local:/Desktop/model/1050_17336_2025-02-20-LowerJaw.stl",
      scale: 1,
      rotation: [1.18, 0, 0],
      exposure: 1.05,
      materialMode: "native",
    },
    occurrence: {
      title: "下颌牙弓",
      body: "下颌牙弓可随下颌运动，排牙时需与上颌牙弓建立稳定的尖窝咬合关系。",
      motif: "jaw",
    },
    microscope: scanViews(),
    organelles: arch("lower"),
  },
  {
    id: "upper-3299",
    name: "上颌 3299",
    type: "上颌牙弓扫描",
    accent: "#5b6fd0",
    accentSoft: "#e6e8fb",
    color: "#e8e2d4",
    modelKind: "upperJaw",
    defaultOrganelle: "incisors",
    comparison: "lower-2181",
    modelAsset: {
      url: "/models/upper-3299.glb",
      format: "glb",
      sourceLabel: "口内扫描 · UpperJaw 3299 (2025-12-07)",
      sourceUrl: "local:/Desktop/model/3299_34214_2025-12-07-UpperJaw.stl",
      scale: 1,
      rotation: [-1.18, 0, 0],
      exposure: 1.05,
      materialMode: "native",
    },
    occurrence: {
      title: "上颌牙弓",
      body: "上颌牙弓的弓形与腭穹高度影响排牙时的牙列宽度与覆盖关系。",
      motif: "jaw",
    },
    microscope: scanViews(),
    organelles: arch("upper"),
  },
  {
    id: "lower-2181",
    name: "下颌 2181",
    type: "下颌牙弓扫描",
    accent: "#3aa39a",
    accentSoft: "#d8f1ee",
    color: "#ebe5d8",
    modelKind: "lowerJaw",
    defaultOrganelle: "incisors",
    comparison: "upper-3299",
    modelAsset: {
      url: "/models/lower-2181.glb",
      format: "glb",
      sourceLabel: "口内扫描 · LowerJaw 2181 (2026-03-28)",
      sourceUrl: "local:/Desktop/model/2181_41255_2026-03-28-LowerJaw.stl",
      scale: 1,
      rotation: [1.18, 0, 0],
      exposure: 1.05,
      materialMode: "native",
    },
    occurrence: {
      title: "下颌牙弓",
      body: "下颌牙弓的 Spee 曲线深度是排牙整平阶段的重要评估指标。",
      motif: "jaw",
    },
    microscope: scanViews(),
    organelles: arch("lower"),
  },
  {
    id: "lower-5192",
    name: "下颌 5192",
    type: "下颌牙弓扫描",
    accent: "#4aa0b6",
    accentSoft: "#dceff4",
    color: "#eae4d7",
    modelKind: "lowerJaw",
    defaultOrganelle: "incisors",
    comparison: "upper-1291",
    modelAsset: {
      url: "/models/lower-5192.glb",
      format: "glb",
      sourceLabel: "口内扫描 · LowerJaw 5192 (2025-12-31)",
      sourceUrl: "local:/Desktop/model/5192_35847_2025-12-31-LowerJaw.stl",
      scale: 1,
      rotation: [1.18, 0, 0],
      exposure: 1.05,
      materialMode: "native",
    },
    occurrence: {
      title: "下颌牙弓",
      body: "下颌牙弓的牙列拥挤程度决定排牙时是否需要扩弓或减数。",
      motif: "jaw",
    },
    microscope: scanViews(),
    organelles: arch("lower"),
  },
];

export function getCellById(id: string) {
  return cells.find((cell) => cell.id === id) ?? cells[0];
}
