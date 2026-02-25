// Страница загрузки 3D-модели
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

  // Сброс масштаба при загрузке новой модели
  useEffect(() => {
    setModelScale(1);
  }, [modelData?.object]);

  const changeScale = (delta) => {
    setModelScale(s => parseFloat(Math.min(10, Math.max(0.1, s + delta)).toFixed(2)));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Загрузить 3D-модель
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Левая колонка: загрузчик + инфо */}
          <div className="space-y-4">
            <ModelUploader />

            {modelLoaded && modelData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Информация о модели
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Box className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium">Файл:</span>
                    <span className="truncate">{modelData.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Ruler className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="font-medium">Объем:</span>
                    <span>{modelData.volume} см³</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Scale className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-medium">Вес:</span>
                    <span>{modelData.weight} г</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Размер файла: {(modelData.fileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка: предпросмотр */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Предпросмотр
            </h2>

            <div style={{ height: '320px', overflow: 'hidden', borderRadius: '0.5rem', position: 'relative' }}>
              <ModelViewer
                ref={viewerRef}
                modelObject={modelData?.object ?? null}
                userScale={modelScale}
                className="rounded-lg"
              />
              {!modelData?.object && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center pointer-events-none">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                    Загрузите 3D-модель для предпросмотра
                  </p>
                </div>
              )}
            </div>

            {/* Кнопки вида */}
            {modelData?.object && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {VIEW_PRESETS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => viewerRef.current?.setView(key)}
                    className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition font-medium"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Поворот модели */}
            {modelData?.object && (
              <div className="mt-1 flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Поворот:</span>
                {ROTATE_PRESETS.map(({ axis, deg, label }) => (
                  <button
                    key={`${axis}${deg}`}
                    onClick={() => viewerRef.current?.rotateModel(axis, deg)}
                    className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-gray-700 dark:text-gray-300 hover:text-orange-700 dark:hover:text-orange-300 transition font-medium"
                    title={`Повернуть на ${deg}° вокруг оси ${axis.toUpperCase()}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Управление масштабом */}
            {modelData?.object && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Масштаб</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeScale(-0.25)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-base"
                    title="Уменьшить"
                  >−</button>

                  <input
                    type="number"
                    min={10}
                    max={1000}
                    step={25}
                    value={Math.round(modelScale * 100)}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 10 && v <= 1000) setModelScale(v / 100);
                    }}
                    className="w-16 text-center text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-600 px-1 py-0.5"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">%</span>

                  <button
                    onClick={() => changeScale(0.25)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-base"
                    title="Увеличить"
                  >+</button>

                  <button
                    onClick={() => setModelScale(1)}
                    className="ml-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >Сброс</button>
                </div>
              </div>
            )}

            {/* Подсказки по управлению */}
            {modelData?.object && (
              <div className="mt-2 flex gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span>🖱 ЛКМ — вращение</span>
                <span>🖱 Колесо — зум</span>
                <span>🖱 ПКМ — перемещение</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
