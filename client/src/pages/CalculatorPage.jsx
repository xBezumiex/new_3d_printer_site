// Страница калькулятора стоимости
import PriceCalculator from '../components/calculator/PriceCalculator';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <PriceCalculator />
        </div>
      </div>
    </div>
  );
}
