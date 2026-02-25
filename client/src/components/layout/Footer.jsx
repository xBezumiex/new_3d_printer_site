// Подвал сайта
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* О компании */}
          <div>
            <h3 className="text-xl font-bold mb-4">3D Print Lab</h3>
            <p className="text-gray-400">
              Профессиональная 3D-печать любой сложности. Качественно, быстро, доступно.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-xl font-bold mb-4">Навигация</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition">
                  Главная
                </a>
              </li>
              <li>
                <a href="/upload" className="hover:text-white transition">
                  Загрузить модель
                </a>
              </li>
              <li>
                <a href="/calculator" className="hover:text-white transition">
                  Калькулятор
                </a>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-xl font-bold mb-4">Контакты</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: i43231360@gmail.com</li>
              <li>Телефон: +7 (XXX) XXX-XX-XX</li>
              <li>Адрес: г. Москва</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} 3D Print Lab. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
