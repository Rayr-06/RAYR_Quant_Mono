# HOW TO PUSH TO GITHUB

## STEP 1: INITIALIZE GIT (if not already done)

```bash
# Navigate to project folder
cd quantforge

# Initialize git (if not already initialized)
git init
```

## STEP 2: CREATE .gitignore

Already created! It ignores:
- node_modules
- .env files (secrets)
- Build outputs
- Editor files

## STEP 3: CREATE GITHUB REPOSITORY

1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `quantforge` (or your choice)
4. Description: "Automated trading system with TradingView integration"
5. Select: Public or Private
6. DO NOT check "Add README" (we already have one)
7. Click "Create repository"

## STEP 4: PUSH TO GITHUB

Copy and run these commands:

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Trading system with TradingView integration"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/quantforge.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## STEP 5: VERIFY

1. Go to your GitHub repository
2. Refresh the page
3. You should see all your files

---

## IMPORTANT: SECRETS SAFETY

**NEVER commit these to GitHub:**
- `.env` files
- API keys
- Access tokens
- Passwords

These are already in `.gitignore` but double-check!

---

## OPTIONAL: ADD GITHUB SECRETS (for CI/CD)

If you want to deploy automatically:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `KITE_API_KEY`
   - `KITE_API_SECRET`
   - `WEBHOOK_SECRET`

---

## QUICK COMMANDS REFERENCE

```bash
# Status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull
git pull

# See commit history
git log --oneline
```

---

## TROUBLEBLING

**"remote origin already exists":**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/quantforge.git
```

**"Permission denied":**
```bash
# Use personal access token instead of password
# Go to GitHub → Settings → Developer settings → Personal access tokens
# Generate new token with repo permissions
```

**"Updates were rejected":**
```bash
git push --force-with-lease
# (Only if you're sure you want to overwrite remote)
```
