#!/bin/bash

# Helper script to update backend URL in config.js

echo "🔧 YT Lemon String - Update Backend URL"
echo "========================================"
echo ""

# Check if URL provided as argument
if [ -z "$1" ]; then
    echo "Please provide your Render backend URL:"
    echo ""
    echo "To find your backend URL:"
    echo "1. Go to https://dashboard.render.com/"
    echo "2. Click on 'yt-lemon-backend' service"
    echo "3. Copy the URL at the top (e.g., https://yt-lemon-backend-abc123.onrender.com)"
    echo ""
    echo "Usage: ./update-backend-url.sh https://your-backend.onrender.com"
    exit 1
fi

BACKEND_URL="$1"

# Remove trailing slash if present
BACKEND_URL="${BACKEND_URL%/}"

echo "✅ Backend URL: $BACKEND_URL"
echo ""

# Update config.js
if [ -f "js/config.js" ]; then
    # Backup original
    cp js/config.js js/config.js.backup

    # Update the URL
    sed -i.tmp "s|BACKEND_URL: 'http://localhost:3000'|BACKEND_URL: '$BACKEND_URL'|g" js/config.js
    rm -f js/config.js.tmp

    echo "✅ Updated js/config.js"
    echo ""

    # Show the change
    echo "📝 Change made:"
    grep "BACKEND_URL:" js/config.js
    echo ""

    # Commit and push
    echo "🚀 Committing changes..."
    git add js/config.js
    git commit -m "Configure backend URL: $BACKEND_URL"
    git push

    echo ""
    echo "✅ Done! Your app will update in ~1 minute"
    echo ""
    echo "🌐 Frontend: https://andrewnakas.github.io/YT_Lemon_String/"
    echo "🔧 Backend:  $BACKEND_URL"
    echo ""
    echo "Test your backend: curl $BACKEND_URL/health"
else
    echo "❌ Error: js/config.js not found"
    echo "Make sure you're in the project root directory"
    exit 1
fi
