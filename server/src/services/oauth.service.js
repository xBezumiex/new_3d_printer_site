// OAuth сервис — Google и GitHub через нативный fetch (Node 18+)
// Не требует passport или дополнительных пакетов

// ──────────────────────────────────────────────
// GOOGLE
// ──────────────────────────────────────────────

/**
 * Возвращает URL для редиректа на Google OAuth
 */
export const getGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

/**
 * Обменивает code на профиль пользователя Google
 * @returns {{ id, email, name, avatar }}
 */
export const getGoogleProfile = async (code) => {
  // 1. Получаем access_token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  process.env.GOOGLE_CALLBACK_URL,
      grant_type:    'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const { access_token } = await tokenRes.json();

  // 2. Получаем данные пользователя
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  const profile = await profileRes.json();

  return {
    id:     profile.id,
    email:  profile.email,
    name:   profile.name,
    avatar: profile.picture,
  };
};

// ──────────────────────────────────────────────
// GITHUB
// ──────────────────────────────────────────────

/**
 * Возвращает URL для редиректа на GitHub OAuth
 */
export const getGithubAuthUrl = () => {
  const params = new URLSearchParams({
    client_id:    process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope:        'user:email',
  });
  return `https://github.com/login/oauth/authorize?${params}`;
};

/**
 * Обменивает code на профиль пользователя GitHub
 * @returns {{ id, email, name, avatar }}
 */
export const getGithubProfile = async (code) => {
  // 1. Получаем access_token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri:  process.env.GITHUB_CALLBACK_URL,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error('GitHub token exchange failed');
  }

  const { access_token, error } = await tokenRes.json();
  if (error || !access_token) {
    throw new Error(`GitHub OAuth error: ${error || 'no access_token'}`);
  }

  // 2. Получаем данные пользователя
  const profileRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'User-Agent':  '3DPrintLab',
      Accept:        'application/vnd.github+json',
    },
  });

  if (!profileRes.ok) {
    throw new Error('Failed to fetch GitHub user info');
  }

  const profile = await profileRes.json();

  // 3. Если email не публичный — запрашиваем отдельно
  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent':  '3DPrintLab',
        Accept:        'application/vnd.github+json',
      },
    });
    if (emailsRes.ok) {
      const emails = await emailsRes.json();
      const primary = emails.find(e => e.primary && e.verified);
      email = primary?.email || emails[0]?.email || null;
    }
  }

  return {
    id:     String(profile.id),
    email,
    name:   profile.name || profile.login,
    avatar: profile.avatar_url,
  };
};
