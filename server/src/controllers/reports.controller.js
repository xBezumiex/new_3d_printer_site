import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/reports.service.js';

export const createReport = asyncHandler(async (req, res) => {
  const data = await svc.createReport(req.user.id, req.body);
  res.status(201).json({ success: true, data });
});
export const getReports = asyncHandler(async (req, res) => {
  const data = await svc.getReports(req.query);
  res.json({ success: true, data });
});
export const updateReportStatus = asyncHandler(async (req, res) => {
  const data = await svc.updateReportStatus(req.params.id, req.body.status);
  res.json({ success: true, data });
});
