// Context для 3D модели и калькулятора
import { createContext, useContext, useState } from 'react';

const ModelContext = createContext();

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel должен использоваться внутри ModelProvider');
  }
  return context;
};

export const ModelProvider = ({ children }) => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelData, setModelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [calcParams, setCalcParams] = useState({
    material: 'PLA',
    quality: 'STANDARD',
    infill: 20,
    quantity: 1,
    volume: 0,
    weight: 0
  });

  const [price, setPrice] = useState(0);

  // Материалы (синхронизировано с backend)
  const materials = {
    PLA: { name: 'PLA', pricePerG: 0.03, density: 1.24 },
    ABS: { name: 'ABS', pricePerG: 0.035, density: 1.04 },
    PETG: { name: 'PETG', pricePerG: 0.04, density: 1.27 },
    TPU: { name: 'TPU (гибкий)', pricePerG: 0.06, density: 1.21 },
    NYLON: { name: 'Nylon', pricePerG: 0.07, density: 1.14 }
  };

  // Качество печати
  const qualities = {
    DRAFT: { name: 'Черновое (0.3мм)', multiplier: 0.8 },
    STANDARD: { name: 'Стандартное (0.2мм)', multiplier: 1.0 },
    HIGH: { name: 'Высокое (0.1мм)', multiplier: 1.5 },
    ULTRA: { name: 'Ультра (0.05мм)', multiplier: 2.0 }
  };

  // Установка модели
  const setModel = (data) => {
    setModelData(data);
    setModelLoaded(true);
    setLoadError(null);

    // Обновляем объем и вес из данных модели
    if (data.volume && data.weight) {
      setCalcParams((prev) => ({
        ...prev,
        volume: data.volume,
        weight: data.weight
      }));
    }
  };

  // Обновление параметров калькулятора
  const updateCalcParams = (updates) => {
    setCalcParams((prev) => {
      const newParams = { ...prev, ...updates };

      // Пересчет веса при изменении материала или заполнения
      if ((updates.material || updates.infill) && prev.volume) {
        const material = materials[newParams.material];
        const volume = parseFloat(newParams.volume) || 0;
        const infillFactor = newParams.infill / 100;
        const weight = volume * material.density * infillFactor;
        newParams.weight = Math.max(0.01, weight).toFixed(2);
      }

      return newParams;
    });
  };

  // Расчет стоимости
  const calculatePrice = () => {
    const { material, quality, infill, quantity, weight } = calcParams;
    if (!weight || parseFloat(weight) <= 0) {
      setPrice(0);
      return;
    }

    const materialCost = parseFloat(weight) * materials[material].pricePerG;
    const qualityCost = materialCost * qualities[quality].multiplier;
    const infillMultiplier = 0.5 + (infill / 100) * 0.5;
    const baseCost = 200; // Базовая стоимость работы
    const totalPerItem = qualityCost * infillMultiplier + baseCost;
    const total = totalPerItem * quantity;

    setPrice(total.toFixed(2));
  };

  // Сброс модели
  const resetModel = () => {
    setModelLoaded(false);
    setModelData(null);
    setLoadError(null);
    setCalcParams((prev) => ({ ...prev, volume: 0, weight: 0 }));
  };

  const value = {
    modelLoaded,
    modelData,
    isLoading,
    loadError,
    calcParams,
    price,
    materials,
    qualities,
    setModel,
    updateCalcParams,
    calculatePrice,
    resetModel,
    setIsLoading,
    setLoadError
  };

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
};
