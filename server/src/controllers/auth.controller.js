// Контроллер авторизации
import * as authService from '../services/auth.service.js';
import * as oauthService from '../services/oauth.service.js';

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

// ──────────────────────────────────────────────
// Локальная авторизация
// ──────────────────────────────────────────────

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Пользователь успешно зарегистрирован', data: { user, token } });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.status(200).json({ success: true, message: 'Успешный вход', data: { user, token } });
  } catch (error) { next(error); }
};

export const logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Успешный выход' });
  } catch (error) { next(error); }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Профиль успешно обновлён', data: { user } });
  } catch (error) { next(error); }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) { next(error); }
};

// ──────────────────────────────────────────────
// Google OAuth
// ──────────────────────────────────────────────

export const googleAuth = (req, res) => {
  res.redirect(oauthService.getGoogleAuthUrl());
};

export const googleCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/oauth-callback?error=access_denied`);
  }

  try {
    const profile = await oauthService.getGoogleProfile(code);
    const { user, token } = await authService.loginWithOAuth({
      provider:   'google',
      providerId: profile.id,
      email:      profile.email,
      name:       profile.name,
      avatar:     profile.avatar,
    });

    const userParam = encodeURIComponent(JSON.stringify(user));
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}&user=${userParam}`);
  } catch (err) {
    console.error('[Google OAuth]', err.message);
    res.redirect(`${FRONTEND_URL}/oauth-callback?error=oauth_failed`);
  }
};

// ──────────────────────────────────────────────
// GitHub OAuth
// ──────────────────────────────────────────────

export const githubAuth = (req, res) => {
  res.redirect(oauthService.getGithubAuthUrl());
};

export const githubCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/oauth-callback?error=access_denied`);
  }

  try {
    const profile = await oauthService.getGithubProfile(code);
    const { user, token } = await authService.loginWithOAuth({
      provider:   'github',
      providerId: profile.id,
      email:      profile.email,
      name:       profile.name,
      avatar:     profile.avatar,
    });

    const userParam = encodeURIComponent(JSON.stringify(user));
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}&user=${userParam}`);
  } catch (err) {
    console.error('[GitHub OAuth]', err.message);
    res.redirect(`${FRONTEND_URL}/oauth-callback?error=oauth_failed`);
  }
};
