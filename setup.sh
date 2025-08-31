#!/bin/bash

echo "🚀 Setting up prod-starter-template..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment variables
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Copied .env.example to .env"
        echo "⚠️  Please update .env with your configuration"
    else
        echo "⚠️  No .env.example found. Please create .env manually"
    fi
fi

# Reset project to initial state
echo "🔄 Setting up database..."
npm run reset --yes

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run 'npm run dev' to start development"
echo "3. Visit http://localhost:3000 to setup your admin account"
