#!/bin/bash

# Script to create GitHub releases
# Usage: ./scripts/create-release.sh [version]

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/create-release.sh [version]"
    echo "Example: ./scripts/create-release.sh v0.2.0"
    exit 1
fi

# Check if tag exists
if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "Error: Tag $VERSION does not exist"
    echo "Available tags:"
    git tag -l
    exit 1
fi

echo "Creating release for $VERSION"

# Get the previous tag
PREVIOUS_TAG=$(git describe --abbrev=0 --tags "$VERSION^" 2>/dev/null || echo "")

if [ -z "$PREVIOUS_TAG" ]; then
    echo "This is the first release"
    COMPARE_URL=""
else
    echo "Comparing with previous tag: $PREVIOUS_TAG"
    COMPARE_URL="**Full Changelog**: https://github.com/yudhnaa/macro-mate/compare/$PREVIOUS_TAG...$VERSION"
fi

# Extract release notes from CHANGELOG.md
echo ""
echo "Release notes from CHANGELOG.md:"
echo "================================"
echo ""

# Find the section for this version in CHANGELOG
awk "/## \[$VERSION\]/,/## \[/" CHANGELOG.md | head -n -1

echo ""
echo "================================"
echo ""
echo "Next steps:"
echo "1. Push tag to GitHub: git push origin $VERSION"
echo "2. Go to: https://github.com/yudhnaa/macro-mate/releases/new?tag=$VERSION"
echo "3. Copy the release notes above"
echo "4. Publish the release"
echo ""
echo "$COMPARE_URL"
