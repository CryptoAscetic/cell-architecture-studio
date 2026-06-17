import {
  ArrowRight,
  Box,
  Brain,
  ChevronDown,
  CircleDot,
  Gauge,
  EyeOff,
  Heart,
  Info,
  Leaf,
  MessageCircle,
  Microscope,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CellScene } from "./components/CellScene";
import { cells, getCellById, type CellItem, type ViewMode } from "./data/cells";
import { assetUrl } from "./lib/assetUrl";

type ModeOption = {
  id: ViewMode;
  label: string;
  Icon: LucideIcon;
};

const modeOptions: ModeOption[] = [
  { id: "mesh", label: "网格", Icon: Box },
  { id: "focus", label: "聚焦", Icon: CircleDot },
];

const initialCell = getCellById("upper-1291");

function Header() {
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-orb" aria-hidden="true">
          <Sparkles size={26} />
        </div>
        <div>
          <h1>排牙智导</h1>
          <p>数字化牙弓模型与智能排牙导览</p>
        </div>
      </div>
    </header>
  );
}

type SidebarProps = {
  selectedCell: CellItem;
  activeOrganelle: string;
  favorites: Set<string>;
  onSelectCell: (id: string) => void;
  onSelectOrganelle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

function MiniCell({ cell }: { cell: CellItem }) {
  if (cell.renderImage?.url) {
    return (
      <span className="mini-cell has-preview" style={{ "--thumb": cell.accent } as CSSProperties}>
        <img src={assetUrl(cell.renderImage.url)} alt="" aria-hidden="true" />
      </span>
    );
  }

  if (cell.modelAsset?.previewUrl) {
    return (
      <span className="mini-cell has-preview" style={{ "--thumb": cell.accent } as CSSProperties}>
        <img src={assetUrl(cell.modelAsset.previewUrl)} alt="" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className={`mini-cell mini-cell-${cell.modelKind}`} style={{ "--thumb": cell.accent } as CSSProperties}>
      <span />
      <i />
      <b />
    </span>
  );
}

function Sidebar({
  selectedCell,
  activeOrganelle,
  favorites,
  onSelectCell,
  onSelectOrganelle,
  onToggleFavorite,
}: SidebarProps) {
  return (
    <aside className="left-rail">
      <section className="panel cell-type-panel">
        <div className="panel-heading">
          <span>
            <Leaf size={18} />
            模型列表
          </span>
          <ChevronDown size={18} />
        </div>

        <div className="cell-list">
          {cells.map((cell) => {
            const selected = selectedCell.id === cell.id;
            return (
              <button
                className={`cell-row ${selected ? "is-active" : ""}`}
                type="button"
                key={cell.id}
                onClick={() => onSelectCell(cell.id)}
              >
                <MiniCell cell={cell} />
                <span className="cell-row-copy">
                  <strong>{cell.name}</strong>
                  <span>{cell.type}</span>
                </span>
                <span
                  className={`favorite-dot ${favorites.has(cell.id) ? "is-on" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(cell.id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`收藏 ${cell.name}`}
                >
                  <Star size={18} fill="currentColor" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel organelle-panel">
        <div className="panel-heading">
          <span>
            <Sparkles size={16} />
            牙位分区
          </span>
          <ChevronDown size={18} />
        </div>

        <div className="organelle-list">
          {selectedCell.organelles.map((organelle) => (
            <button
              className={`organelle-row ${activeOrganelle === organelle.id ? "is-active" : ""}`}
              type="button"
              key={organelle.id}
              onClick={() => onSelectOrganelle(organelle.id)}
            >
              <span className="color-dot" style={{ background: organelle.color }} />
              <span>{organelle.name}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

type StageProps = {
  cell: CellItem;
  activeOrganelle: string;
  viewMode: ViewMode;
  crossSection: boolean;
  autoRotate: boolean;
  resetKey: number;
  onModeChange: (mode: ViewMode) => void;
  onCrossSectionChange: (value: boolean) => void;
  onAutoRotateChange: (value: boolean) => void;
  onReset: () => void;
  onToast: (message: string) => void;
};

function Stage({
  cell,
  activeOrganelle,
  viewMode,
  crossSection,
  autoRotate,
  resetKey,
  onModeChange,
  onCrossSectionChange,
  onAutoRotateChange,
  onReset,
  onToast,
}: StageProps) {
  return (
    <main className="stage-column">
      <section className="stage-panel">
        <div className="stage-title">
          <div>
            <h2>{cell.name}</h2>
            <p>{cell.type}</p>
          </div>

          <div className="view-card">
            <span>视图模式</span>
            <div className="mode-switcher">
              {modeOptions.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={viewMode === id ? "is-active" : ""}
                  onClick={() => onModeChange(id)}
                  title={label}
                >
                  <Icon size={22} />
                </button>
              ))}
            </div>
            <label className="toggle-line">
              <span>横截面</span>
              <input
                type="checkbox"
                checked={crossSection}
                onChange={(event) => onCrossSectionChange(event.target.checked)}
              />
              <i />
            </label>
          </div>
        </div>

        <div className="canvas-wrap">
          <CellScene
            cell={cell}
            activeOrganelle={activeOrganelle}
            viewMode={viewMode}
            crossSection={crossSection}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </div>

        <div className="stage-toolbar">
          <button
            type="button"
            className={autoRotate ? "is-active" : ""}
            onClick={() => onAutoRotateChange(!autoRotate)}
          >
            <RotateCcw size={20} />
            旋转
          </button>
          <button type="button" onClick={() => onModeChange("focus")}>
            <CircleDot size={20} />
            隔离
          </button>
          <button type="button" onClick={() => onModeChange("focus")}>
            <EyeOff size={20} />
            隐藏其他
          </button>
          <button type="button" onClick={onReset}>
            <RotateCcw size={20} />
            重置视图
          </button>
        </div>

      </section>
    </main>
  );
}

type RightPanelProps = {
  cell: CellItem;
  activeOrganelle: string;
  favorites: Set<string>;
  mastery: number;
  viewedCellCount: number;
  viewedOrganelleCount: number;
  totalOrganelleCount: number;
  tutorPrompt: string;
  onToggleFavorite: (id: string) => void;
  onTutorPrompt: (prompt: string) => void;
};

function buildTutorPrompts(cell: CellItem, organelle: CellItem["organelles"][number]) {
  return [
    `讲解 ${cell.name} 中 ${organelle.name} 的排牙要点。`,
    `对比 ${cell.name} 与 ${getCellById(cell.comparison).name} 的咬合关系。`,
    `指导我在 3D 模型中定位 ${organelle.name}。`,
  ];
}

function RightPanel({
  cell,
  activeOrganelle,
  favorites,
  mastery,
  viewedCellCount,
  viewedOrganelleCount,
  totalOrganelleCount,
  tutorPrompt,
  onToggleFavorite,
  onTutorPrompt,
}: RightPanelProps) {
  const organelle = cell.organelles.find((item) => item.id === activeOrganelle) ?? cell.organelles[0];
  const tutorPrompts = buildTutorPrompts(cell, organelle);

  return (
    <aside className="right-rail">
      <section className="panel details-panel">
        <div className="panel-heading detail-heading">
          <span>牙位详情</span>
          <button type="button" onClick={() => onToggleFavorite(cell.id)} aria-label="切换收藏">
            <Heart size={22} fill={favorites.has(cell.id) ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="detail-hero">
          <span className="organelle-orb" style={{ background: organelle.color }} />
          <div>
            <h3>{organelle.name}</h3>
            <p>{organelle.subtitle}</p>
          </div>
        </div>

        <dl className="attribute-list">
          {organelle.attributes.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
          <div>
            <dt>标签</dt>
            <dd>
              <span className="mini-toggle is-on" />
              <span className="detail-dot" style={{ background: organelle.color }} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="panel notes-panel">
        <div className="panel-heading">
          <span>临床笔记</span>
        </div>
        <p>{organelle.note}</p>
        <div className="fun-fact">
          <span>小提示：{organelle.fact}</span>
          <Sparkles size={18} />
        </div>
      </section>

      <section className="panel learning-panel">
        <div className="panel-heading">
          <span>
            <Brain size={17} />
            AI 导师
          </span>
        </div>

        <div className="mastery-meter" style={{ "--progress": `${mastery}%` } as CSSProperties}>
          <div>
            <Gauge size={18} />
            <span>掌握程度</span>
            <strong>{mastery}%</strong>
          </div>
          <i>
            <b />
          </i>
          <small>
            已查看 {viewedCellCount}/{cells.length} 个模型 · 已浏览 {viewedOrganelleCount}/{totalOrganelleCount} 个牙位分区
          </small>
        </div>

        <div className="lesson-focus">
          <span>
            <Target size={17} />
            当前学习重点
          </span>
          <p>
            定位 <strong>{organelle.name}</strong>，了解其排牙要点，然后与 {getCellById(cell.comparison).name} 的对应牙位进行比较。
          </p>
        </div>

        <div className="tutor-prompt">
          <span>
            <MessageCircle size={17} />
            已准备好向 AI 导师提问
          </span>
          <p>{tutorPrompt}</p>
        </div>

        <div className="prompt-list">
          {tutorPrompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => onTutorPrompt(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="panel occurrence-panel">
        <div className="panel-heading">
          <span>临床信息</span>
        </div>
        <div className={`occurrence-art occurrence-${cell.occurrence.motif}`}>
          <span />
          <i />
          <b />
        </div>
        <h4>{cell.occurrence.title}</h4>
        <p>{cell.occurrence.body}</p>
      </section>
    </aside>
  );
}

type BottomPanelsProps = {
  cell: CellItem;
  onCompare: () => void;
  onToast: (message: string) => void;
};

function BottomPanels({ cell, onCompare, onToast }: BottomPanelsProps) {
  const comparedCell = getCellById(cell.comparison);

  return (
    <section className="bottom-grid">
      <div className="panel microscope-panel">
        <div className="panel-heading">
          <span>
            扫描视图
            <Info size={16} />
          </span>
        </div>
        <div className="micro-card-row">
          {cell.microscope.map((image) => (
            <button
              type="button"
              key={image.label}
              className={`micro-card pattern-${image.pattern}`}
              style={{ "--micro": image.tone } as CSSProperties}
              onClick={() => onToast(`已选择 ${image.label}`)}
            >
              <span />
              <strong>{image.label}</strong>
            </button>
          ))}
          <button type="button" className="micro-card add-card" onClick={() => onToast("图片上传功能开发中")}>
            <Plus size={28} />
            <strong>添加图片</strong>
          </button>
        </div>
      </div>

      <div className="panel compare-panel">
        <div className="panel-heading">
          <span>
            模型对比
            <Info size={16} />
          </span>
        </div>
        <div className="compare-row">
          <div>
            <MiniCell cell={cell} />
            <span>
              <strong>{cell.name}</strong>
              <em>当前位置</em>
            </span>
          </div>
          <b>对比</b>
          <div>
            <span>
              <strong>{comparedCell.name}</strong>
              <em>{comparedCell.type}</em>
            </span>
            <MiniCell cell={comparedCell} />
          </div>
        </div>
        <button type="button" className="comparison-button" onClick={onCompare}>
          打开对比视图
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}

type ComparisonModalProps = {
  cell: CellItem;
  open: boolean;
  onClose: () => void;
};

function ComparisonModal({ cell, open, onClose }: ComparisonModalProps) {
  const comparedCell = getCellById(cell.comparison);
  if (!open) {
    return null;
  }

  const currentOrganelle = cell.organelles.find((item) => item.id === cell.defaultOrganelle) ?? cell.organelles[0];
  const comparedOrganelle =
    comparedCell.organelles.find((item) => item.id === comparedCell.defaultOrganelle) ?? comparedCell.organelles[0];

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label="模型对比">
      <div className="comparison-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          关闭
        </button>
        <div className="comparison-modal-head">
          <h3>对比视图</h3>
          <p>
            {cell.name} 与 {comparedCell.name} 的对比
          </p>
        </div>
        <div className="comparison-columns">
          {[cell, comparedCell].map((item) => {
            const organelle = item.id === cell.id ? currentOrganelle : comparedOrganelle;
            return (
              <section key={item.id}>
                <MiniCell cell={item} />
                <h4>{item.name}</h4>
                <p>{item.type}</p>
                <dl>
                  <div>
                    <dt>默认牙位</dt>
                    <dd>{organelle.name}</dd>
                  </div>
                  <div>
                    <dt>分区说明</dt>
                    <dd>{organelle.subtitle}</dd>
                  </div>
                  <div>
                    <dt>临床信息</dt>
                    <dd>{item.occurrence.title}</dd>
                  </div>
                </dl>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return <div className="toast">{message}</div>;
}

export default function App() {
  const [selectedCellId, setSelectedCellId] = useState(initialCell.id);
  const [activeOrganelle, setActiveOrganelle] = useState(initialCell.defaultOrganelle);
  const [viewMode, setViewMode] = useState<ViewMode>("mesh");
  const [crossSection, setCrossSection] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set([initialCell.id]));
  const [viewedCells, setViewedCells] = useState<Set<string>>(() => new Set([initialCell.id]));
  const [viewedOrganelleKeys, setViewedOrganelleKeys] = useState<Set<string>>(
    () => new Set([`${initialCell.id}:${initialCell.defaultOrganelle}`]),
  );
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [tutorPrompt, setTutorPrompt] = useState(
    `指导我在 3D 模型中定位 ${initialCell.organelles[0].name}。`,
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const selectedCell = useMemo(() => getCellById(selectedCellId), [selectedCellId]);
  const totalOrganelleCount = useMemo(
    () => cells.reduce((total, cell) => total + cell.organelles.length, 0),
    [],
  );
  const mastery = useMemo(() => {
    const cellCoverage = viewedCells.size / cells.length;
    const organelleCoverage = viewedOrganelleKeys.size / totalOrganelleCount;
    return Math.round((cellCoverage * 0.42 + organelleCoverage * 0.58) * 100);
  }, [totalOrganelleCount, viewedCells, viewedOrganelleKeys]);

  useEffect(() => {
    setActiveOrganelle(selectedCell.defaultOrganelle);
    setComparisonOpen(false);
  }, [selectedCell]);

  useEffect(() => {
    setViewedCells((current) => {
      const next = new Set(current);
      next.add(selectedCell.id);
      return next;
    });
    setViewedOrganelleKeys((current) => {
      const next = new Set(current);
      next.add(`${selectedCell.id}:${activeOrganelle}`);
      return next;
    });
  }, [activeOrganelle, selectedCell.id]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const shellStyle = {
    "--accent": selectedCell.accent,
    "--accent-soft": selectedCell.accentSoft,
    "--cell-color": selectedCell.color,
  } as CSSProperties;

  return (
    <div className="app-shell" style={shellStyle}>
      <Header />

      <div className="app-grid">
        <Sidebar
          selectedCell={selectedCell}
          activeOrganelle={activeOrganelle}
          favorites={favorites}
          onSelectCell={setSelectedCellId}
          onSelectOrganelle={setActiveOrganelle}
          onToggleFavorite={toggleFavorite}
        />

        <div className="center-stack">
          <Stage
            cell={selectedCell}
            activeOrganelle={activeOrganelle}
            viewMode={viewMode}
            crossSection={crossSection}
            autoRotate={autoRotate}
            resetKey={resetKey}
            onModeChange={setViewMode}
            onCrossSectionChange={setCrossSection}
            onAutoRotateChange={setAutoRotate}
            onReset={() => {
              setResetKey((key) => key + 1);
              showToast("视图已重置");
            }}
            onToast={showToast}
          />
          <BottomPanels
            cell={selectedCell}
            onCompare={() => setComparisonOpen(true)}
            onToast={showToast}
          />
        </div>

        <RightPanel
          cell={selectedCell}
          activeOrganelle={activeOrganelle}
          favorites={favorites}
          mastery={mastery}
          viewedCellCount={viewedCells.size}
          viewedOrganelleCount={viewedOrganelleKeys.size}
          totalOrganelleCount={totalOrganelleCount}
          tutorPrompt={tutorPrompt}
          onToggleFavorite={toggleFavorite}
          onTutorPrompt={(prompt) => {
            setTutorPrompt(prompt);
            showToast("AI 导师提示已准备");
          }}
        />
      </div>

      <ComparisonModal cell={selectedCell} open={comparisonOpen} onClose={() => setComparisonOpen(false)} />
      <Toast message={toast} />
    </div>
  );
}
