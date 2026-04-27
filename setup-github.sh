#!/bin/bash

# ============================================
# QUICK GITHUB SETUP SCRIPT
# ============================================
# Run this script to push to GitHub
# Usage: bash setup-github.sh
# ============================================

echo ""
echo "========================================="
echo "🚀 QuantForge GitHub Setup"
echo "========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Install it first:"
    echo "   Windows: https://git-scm.com/download/win"
    echo "   Mac: brew install git"
    echo "   Linux: sudo apt install git"
    exit 1
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repository name
read -p "Enter repository name (quantforge): " REPO_NAME
REPO_NAME=${REPO_NAME:-quantforge}

echo ""
echo "📋 Setup Steps:"
echo "1. Create repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Name: $REPO_NAME"
echo "   DO NOT add README, .gitignore, or license"
echo ""
read -p "Press Enter when repository is created..."

# Initialize git
echo ""
echo "📦 Initializing git..."
git init

# Add files
echo "📝 Adding files..."
git add .

# Commit
echo "💾 Committing..."
git commit -m "Initial commit: QuantForge trading system"

# Add remote
echo "🔗 Adding GitHub remote..."
git remote remove origin 2>/dev/null  # Remove if exists
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "========================================="
echo "✅ DONE! Repository pushed to GitHub"
echo "========================================="
echo ""
echo "View your repository:"
echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
