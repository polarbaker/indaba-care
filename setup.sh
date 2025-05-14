#!/bin/bash

echo "======================================"
echo "Indaba Care Development Setup Script"
echo "======================================"

echo ""
echo "🧹 Cleaning previous installation..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 Installing dependencies..."
echo "Using --legacy-peer-deps to handle React version conflicts..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Setup completed successfully!"
  echo ""
  echo "To start the development server:"
  echo "  npm run dev"
  echo ""
  echo "To run tests:"
  echo "  npm test"
  echo ""
  echo "For more information, see DEPENDENCY_STANDARDIZATION.md"
  echo "======================================"
else
  echo ""
  echo "❌ Setup failed. Please check the error messages above."
  echo "   For troubleshooting, see DEPENDENCY_STANDARDIZATION.md"
  echo "======================================"
  exit 1
fi
