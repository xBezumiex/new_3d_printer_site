// Утилита для обработки async/await в Express
// Автоматически ловит ошибки и передает их в middleware обработки ошибок

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
