// Кастомные классы ошибок

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Не авторизован') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещен') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Некорректный запрос') {
    super(message, 400);
  }
}
