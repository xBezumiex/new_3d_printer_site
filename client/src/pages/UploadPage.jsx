import { useState, useEffect, useRef } from 'react';
import { useModel } from '../context/ModelContext';
import ModelUploader from '../components/model/ModelUploader';
import ModelViewer from '../components/model/ModelViewer';
import { Box, Ruler, Scale } from 'lucide-react';

const VIEW_PRESETS = [
  { key: 'front',  label: 'Спереди' },
  { key: 'back',   label: 'Сзади'   },
  { key: 'left',   label: 'Слева'   },
  { key: 'right',  label: 'Справа'  },
  { key: 'top',    label: 'Сверху'  },
  { key: 'reset',  label: '↺'       },
];

const ROTATE_PRESETS = [
  { axis: 'x', deg: 90,  label: '↑ X' },
  { axis: 'x', deg: -90, label: '↓ X' },
  { axis: 'y', deg: 90,  label: '← Y' },
  { axis: 'y', deg: -90, label: '→ Y' },
  { axis: 'z', deg: 90,  label: '↶ Z' },
  { axis: 'z', deg: -90, label: '↷ Z' },
];

export default function UploadPage() {
  const { modelData, modelLoaded } = useModel();
  const [modelScale, setModelScale] = useState(1);
  const viewerRef = useRef(null);

  useEffect(() => { setModelScale(1); }, [modelData?.object]);

  const changeScale = (delta) => {
    setModelScale(s => parseFloat(Math.min(10, Math.max(0.1, s + delta)).toFixed(2)));
  };

  const btnBase = {
    fontFamily: 'DM Mono, monospace', fontSize: 11, padding: '4px 10px',
    background: 'var(--bg-raised)', border: '1px solid var(--border-strong)',
    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '32px 0 24px' }}>
        <div className="container mx-auto px-6">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ загрузка</p>
          <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            ЗАГРУЗИТЬ 3D-МОДЕЛЬ
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left: uploader + info */}
          <div className="space-y-4">
            <ModelUploader />

            {modelLoaded && modelData && (
              <div className="glass p-5">
                <p className="font-mono text-[10px] tracking-widest2 uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
                  Информация о модели
                </p>
                <div className="space-y-3">
                  {[
                    [Box,   'var(--accent)',   'Файл',         modelData.fileName],
                    [Ruler, '#4ADE80',          'Объём',        `${modelData.volume} см³`],
                    [Scale, '#C084FC',          'Вес',          `${modelData.weight} г`],
                    [null,  'var(--text-muted)','Размер файла', `${(modelData.fileSize / 1024 / 1024).toFixed(2)} MB`],
                  ].map(([Icon, color, label, value]) => (
                    <div key={label} className="flex items-center gap-3">
                      {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color }} />}
                      {!Icon && <div className="w-4 h-4 shrink-0" />}
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)', minWidth: 80 }}>{label}:</span>
                      <span className="font-sans text-sm truncate" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: preview */}
          <div className="glass p-5">
            <p className="font-mono text-[10px] tracking-widest2 uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              Предпросмотр
            </p>

            <div style={{ height: 320, overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
              <ModelViewer ref={viewerRef} modelObject={modelData?.object ?? null} userScale={modelScale} />
              {!modelData?.object && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ background: 'var(--bg-raised)' }}>
                  <p className="font-sans text-sm text-center px-4" style={{ color: 'var(--text-muted)' }}>
                    Загрузите 3D-модель для предпросмотра
                  </p>
                </div>
              )}
            </div>

            {modelData?.object && (
              <>
                {/* View buttons */}
                <div className="mt-3 flex gap-1 flex-wrap">
                  {VIEW_PRESETS.map(({ key, label }) => (
                    <button key={key} onClick={() => viewerRef.current?.setView(key)} style={btnBase}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,0,0.1)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Rotate buttons */}
                <div className="mt-2 flex items-center gap-1 flex-wrap">
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)', marginRight: 4 }}>Поворот:</span>
                  {ROTATE_PRESETS.map(({ axis, deg, label }) => (
                    <button key={`${axis}${deg}`} onClick={() => viewerRef.current?.rotateModel(axis, deg)} style={btnBase}
                      title={`Повернуть на ${deg}° вокруг оси ${axis.toUpperCase()}`}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.1)'; e.currentTarget.style.color = '#4F8EF7'; e.currentTarget.style.borderColor = '#4F8EF7'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Scale */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>Масштаб</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => changeScale(-0.25)} style={{ ...btnBase, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 16 }}>−</button>
                    <input type="number" min={10} max={1000} step={25}
                      value={Math.round(modelScale * 100)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 10 && v <= 1000) setModelScale(v / 100); }}
                      className="text-center font-mono text-sm"
                      style={{ width: 64, background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '2px 4px' }} />
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>%</span>
                    <button onClick={() => changeScale(0.25)} style={{ ...btnBase, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 16 }}>+</button>
                    <button onClick={() => setModelScale(1)}
                      className="font-mono text-[10px] transition-colors"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginLeft: 4 }}>Сброс</button>
                  </div>
                </div>

                {/* Hints */}
                <div className="mt-2 flex gap-4 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span>ЛКМ — вращение</span>
                  <span>Колесо — зум</span>
                  <span>ПКМ — перемещение</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
