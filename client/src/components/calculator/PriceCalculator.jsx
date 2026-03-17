// Калькулятор стоимости 3D-печати с детальной разбивкой
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useModel } from '../../context/ModelContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MATERIAL_DESC = {
  PLA:   'Экологичный, лёгкий в печати. Подходит для большинства задач.',
  ABS:   'Прочный и термостойкий. Хорош для функциональных деталей.',
  PETG:  'Баланс прочности и гибкости. Влагостойкий.',
  TPU:   'Гибкий и эластичный. Для мягких деталей и прокладок.',
  NYLON: 'Максимальная прочность и износостойкость.',
};

const QUALITY_DESC = {
  DRAFT:    'Быстрая печать, видимые слои. Для черновиков и прототипов.',
  STANDARD: 'Баланс скорости и качества. Для большинства задач.',
  HIGH:     'Высокая детализация, гладкая поверхность.',
  ULTRA:    'Максимальная точность. Для ювелирных моделей и миниатюр.',
};

export default function PriceCalculator() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { modelLoaded, calcParams, price, materials, qualities, updateCalcParams, calculatePrice } =
    useModel();

  const handleOrder = () => {
    if (!modelLoaded) {
      toast.error('Сначала загрузите 3D-модель');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Войдите в аккаунт для оформления заказа');
      navigate('/login');
      return;
    }
    navigate('/order');
  };

  const handleChange = (field, value) => {
    updateCalcParams({ [field]: value });
  };

  useEffect(() => {
    calculatePrice();
  }, [calcParams, calculatePrice]);

  // Разбивка стоимости
  const mat = materials[calcParams.material];
  const qual = qualities[calcParams.quality];
  const weight = parseFloat(calcParams.weight) || 0;
  const infillFactor = 0.5 + (calcParams.infill / 100) * 0.5;
  const materialCost = weight * mat.pricePerG;
  const qualityMaterialCost = materialCost * qual.multiplier;
  const totalMaterialCost = qualityMaterialCost * infillFactor;
  const baseCost = 200;
  const perItem = totalMaterialCost + baseCost;
  const total = perItem * calcParams.quantity;

  const infillLabel =
    calcParams.infill <= 20 ? 'Лёгкое' :
    calcParams.infill <= 50 ? 'Среднее' :
    calcParams.infill <= 80 ? 'Плотное' : 'Монолитное';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Калькулятор стоимости
      </h3>

      {!modelLoaded && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            Загрузите 3D-модель для точного расчёта объёма и веса.
            Без модели цена рассчитывается приблизительно.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Материал */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Материал
          </label>
          <select
            value={calcParams.material}
            onChange={(e) => handleChange('material', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {Object.entries(materials).map(([key, m]) => (
              <option key={key} value={key}>
                {m.name} — {(m.pricePerG * 1000).toFixed(0)} руб/кг
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            {MATERIAL_DESC[calcParams.material]}
          </p>
        </div>

        {/* Качество */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Качество печати
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(qualities).map(([key, q]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChange('quality', key)}
                className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                  calcParams.quality === key
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="font-semibold">{q.name.split(' ')[0]}</div>
                <div className="text-xs opacity-70">{q.name.split('(')[1]?.replace(')', '') || ''}</div>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            {QUALITY_DESC[calcParams.quality]}
          </p>
        </div>

        {/* Заполнение */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Заполнение
            </label>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {calcParams.infill}% — {infillLabel}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={calcParams.infill}
            onChange={(e) => handleChange('infill', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            <span>10% (лёгкий)</span>
            <span>55% (средний)</span>
            <span>100% (монолит)</span>
          </div>
        </div>

        {/* Количество */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Количество копий
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChange('quantity', Math.max(1, calcParams.quantity - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={calcParams.quantity}
              onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
              className="flex-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => handleChange('quantity', Math.min(100, calcParams.quantity + 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Детальная разбивка */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Разбивка стоимости
            </h4>

            {/* Параметры модели */}
            {modelLoaded && (
              <div className="mb-4 pb-4 border-b border-blue-200 dark:border-blue-800">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  <span>Объём модели</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{calcParams.volume} см³</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Масса материала</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{calcParams.weight} г</span>
                </div>
              </div>
            )}

            {/* Стоимостные строки */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Материал ({mat.name})</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {totalMaterialCost.toFixed(2)} ₽
                </span>
              </div>
              {qual.multiplier !== 1.0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 text-xs pl-3">
                    × коэф. качества {qual.multiplier}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(materialCost * qual.multiplier).toFixed(2)} ₽ до заполнения
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Работа (базовая)</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{baseCost} ₽</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 pl-3">
                <span>1 изделие</span>
                <span>{perItem.toFixed(2)} ₽</span>
              </div>
              {calcParams.quantity > 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">× {calcParams.quantity} шт.</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{total.toFixed(2)} ₽</span>
                </div>
              )}
            </div>

            {/* Итого */}
            <div className="pt-3 border-t border-blue-200 dark:border-blue-700 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Итого:</span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {price} ₽
              </span>
            </div>
          </div>

          {/* Кнопка заказа */}
          <button
            onClick={handleOrder}
            disabled={!modelLoaded || parseFloat(price) <= 0}
            className={`mt-4 w-full py-4 font-bold text-lg rounded-lg transition-all shadow-md flex items-center justify-center gap-2 ${
              modelLoaded && parseFloat(price) > 0
                ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {!modelLoaded ? (
              <>📂 Загрузите модель для заказа</>
            ) : (
              <>🛒 Оформить заказ — {price} ₽</>
            )}
          </button>

          {modelLoaded && (
            <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
              Нажимая кнопку, вы перейдёте к форме оформления заказа
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
