@echo off
echo Creating server\.env ...
(
echo NODE_ENV=development
echo PORT=5000
echo DATABASE_URL=postgresql://postgres:postgres@postgres:5432/3d_print_db
echo JWT_SECRET=change_this_secret_in_production_please
echo JWT_EXPIRES_IN=7d
echo CLIENT_URL=http://localhost
echo CLOUDINARY_CLOUD_NAME=
echo CLOUDINARY_API_KEY=
echo CLOUDINARY_API_SECRET=
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=
echo SMTP_PASS=
echo EMAIL_FROM=
echo FRONTEND_URL=http://localhost
echo GOOGLE_CLIENT_ID=REPLACE_ME
echo GOOGLE_CLIENT_SECRET=REPLACE_ME
echo GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
echo GITHUB_CLIENT_ID=REPLACE_ME
echo GITHUB_CLIENT_SECRET=REPLACE_ME
echo GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
) > server\.env
echo Done! Edit server\.env and replace REPLACE_ME with real credentials.
pause
