#!/bin/bash
# Git helper script for the autonomous car simulation project

echo "Git Helper Script for Autonomous Car Simulation"
echo "=============================================="
echo "Available commands:"
echo "1. Status - Check repository status"
echo "2. Commit - Add all changes and commit"
echo "3. Log - View commit history"
echo "4. Branches - List all branches"
echo "5. Main - Switch to main branch"
echo "6. Dev - Switch to development branch"
echo ""
echo "Enter your choice (1-6):"
read choice

case $choice in
  1)
    echo "Checking repository status..."
    git status
    ;;
  2)
    echo "Enter commit message:"
    read message
    git add .
    git commit -m "$message"
    ;;
  3)
    echo "Viewing commit history..."
    git log --oneline
    ;;
  4)
    echo "Listing all branches..."
    git branch
    ;;
  5)
    echo "Switching to main branch..."
    git checkout main
    ;;
  6)
    echo "Switching to development branch..."
    git checkout development
    ;;
  *)
    echo "Invalid choice. Please run the script again and select 1-6."
    ;;
esac