// Калькулятор стоимости 3D-печати
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModel } from '../../context/ModelContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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

  // Автоматический пересчет цены при изменении параметров
  useEffect(() => {
    calculatePrice();
  }, [calcParams, calculatePrice]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Калькулятор стоимости
      </h3>

      {!modelLoaded && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-300">
            Сначала загрузите 3D модель для точного расчета объема и веса
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(materials).map(([key, mat]) => (
              <option key={key} value={key}>
                {mat.name} - {mat.pricePerG} руб/г
              </option>
            ))}
          </select>
        </div>

        {/* Качество печати */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Качество печати
          </label>
          <select
            value={calcParams.quality}
            onChange={(e) => handleChange('quality', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(qualities).map(([key, qual]) => (
              <option key={key} value={key}>
                {qual.name}
              </option>
            ))}
          </select>
        </div>

        {/* Заполнение */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Заполнение: {calcParams.infill}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={calcParams.infill}
            onChange={(e) => handleChange('infill', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Количество копий */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Количество копий
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={calcParams.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Детали расчета */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Детали расчета
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Объем модели:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calcParams.volume} см³
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Вес материала:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calcParams.weight} г
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Материал:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {materials[calcParams.material].name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Качество:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {qualities[calcParams.quality].name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Заполнение:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calcParams.infill}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Количество:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calcParams.quantity} шт.
                </span>
              </div>
            </div>
            <div className="border-t border-blue-200 dark:border-blue-800 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Итого:</span>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {price} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Кнопка заказа */}
          <button
            onClick={handleOrder}
            disabled={!modelLoaded || parseFloat(price) <= 0}
            className="mt-4 w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition shadow-md hover:shadow-lg"
          >
            {!modelLoaded
              ? 'Загрузите модель для заказа'
              : `Оформить заказ — ${price} ₽`}
          </button>

          {modelLoaded && (
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Нажимая кнопку, вы перейдёте к форме оформления заказа
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
