import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const createReport = async (reporterId, { targetType, targetId, reason }) => {
  if (!reason?.trim()) throw new BadRequestError('Укажите причину жалобы');

  const existing = await prisma.report.findFirst({
    where: { reporterId, targetType, targetId },
  });
  if (existing) throw new BadRequestError('Вы уже отправили жалобу на этот объект');

  return prisma.report.create({
    data: { reporterId, targetType, targetId, reason: reason.trim() },
  });
};

export const getReports = async ({ status, page = 1, limit = 20 }) => {
  const where = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);
  return { reports, total, page, limit };
};

export const updateReportStatus = async (reportId, status) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new NotFoundError('Жалоба не найдена');
  return prisma.report.update({ where: { id: reportId }, data: { status } });
};
