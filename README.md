# Khata App

This repo is the Khata app (Flask). This README includes quick steps to push the project to GitHub and deploy on Render.

## Quick local steps (PowerShell)

1. Install Git on your machine if needed: https://git-scm.com/downloads
2. From project root:

```powershell
cd "C:\Users\HP\Downloads\khata app - Copy (3)\khata app - Copy"
git init
git add .
git commit -m "Initial commit"
```

3. Create a new GitHub repository (via GitHub UI), then add the remote and push:

```powershell
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

## Prepare for Render

- Ensure `requirements.txt` contains `gunicorn` (added here).
- Use `gunicorn app:app` as the start command (Render will set `$PORT`).

## Deploy on Render (summary)

1. Sign in to Render and click **New** → **Web Service**.
2. Connect your GitHub account and select this repository.
3. For **Build Command** use: `pip install -r requirements.txt`
4. For **Start Command** use: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Add any environment variables (e.g., `SECRET_KEY`, DB connection strings) in Render dashboard.

## Notes
- If your Flask app entrypoint is not `app:app`, update the `gunicorn` command accordingly.
- If you need a database (Postgres), create it in Render and set the connection string in env vars.
