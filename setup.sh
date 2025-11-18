#!/bin/bash

# Quick Start Script for Code Snippets MySQL Migration

echo "🚀 Code Snippets - MySQL Migration Setup"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🗄️  Database Setup"
echo "=================="
echo "MySQL Configuration:"
echo "  Host: sv63.ifastnet12.org"
echo "  User: masakali_kiran"
echo "  Database: masakali_code_snippets"
echo ""

# Push database schema
echo "📤 Pushing database schema..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Database schema pushed successfully!"
else
    echo "❌ Failed to push database schema"
    echo "Please check your MySQL connection settings"
    exit 1
fi

echo ""
echo "🔐 Authentication Setup"
echo "======================"
echo "JWT Secret: Using default (change in production!)"
echo "For production, set JWT_SECRET environment variable"
echo ""

echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  http://localhost:5001"
echo ""
echo "📚 Next Steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Open http://localhost:5001 in your browser"
echo "3. Create a new account (sign up)"
echo "4. Start using the application!"
echo ""
echo "📖 Documentation:"
echo "- MIGRATION_GUIDE.md - Complete migration patterns"
echo "- MIGRATION_STATUS.md - What's done and what's left"
echo ""
echo "⚠️  Important:"
echo "Some frontend files still need migration from Firebase to MySQL API."
echo "See MIGRATION_STATUS.md for the complete list."
echo ""
