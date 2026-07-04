#!/bin/bash
# Quick start script for Rotaract Platform

echo "🚀 Rotaract Platform - Quick Start"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Setting up environment..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo "⚠️  Please update .env.local with your configuration"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Update .env.local with your database and Supabase credentials"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  - Setup guide: SETUP.md"
echo "  - Architecture: ARCHITECTURE.md"
echo "  - README: README.md"
echo ""
