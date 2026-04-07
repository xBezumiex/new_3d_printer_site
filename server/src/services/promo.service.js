import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const validatePromo = async (code) => {
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!promo) throw new NotFoundError('Промокод не найден');
  if (!promo.isActive) throw new BadRequestError('Промокод неактивен');
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new BadRequestError('Срок действия промокода истёк');
  if (promo.usedCount >= promo.maxUses) throw new BadRequestError('Промокод исчерпан');
  return { code: promo.code, discount: promo.discount };
};

export const applyPromo = async (code) => {
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!promo) throw new NotFoundError('Промокод не найден');
  if (!promo.isActive) throw new BadRequestError('Промокод неактивен');
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new BadRequestError('Срок действия промокода истёк');
  if (promo.usedCount >= promo.maxUses) throw new BadRequestError('Промокод исчерпан');

  // Атомарное увеличение счётчика только если лимит ещё не исчерпан
  const updated = await prisma.promoCode.updateMany({
    where: { id: promo.id, usedCount: { lt: promo.maxUses }, isActive: true },
    data: { usedCount: { increment: 1 } },
  });

  if (updated.count === 0) throw new BadRequestError('Промокод исчерпан');
  return { discount: promo.discount };
};

export const createPromo = async ({ code, discount, maxUses, expiresAt }) => {
  const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (existing) throw new BadRequestError('Промокод уже существует');
  return prisma.promoCode.create({
    data: { code: code.toUpperCase().trim(), discount, maxUses: maxUses || 100, expiresAt: expiresAt || null },
  });
};

export const getPromos = async () => {
  return prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
};

export const togglePromo = async (id) => {
  const p = await prisma.promoCode.findUnique({ where: { id } });
  if (!p) throw new NotFoundError('Промокод не найден');
  return prisma.promoCode.update({ where: { id }, data: { isActive: !p.isActive } });
};

export const deletePromo = async (id) => {
  await prisma.promoCode.delete({ where: { id } });
  return { success: true };
};
