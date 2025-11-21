#!/bin/bash

# Script to add JT-48-1- prefix to Juyo 48 Koto files
# Format: "001 Name.jpg" → "JT-48-1-001 Name.jpg"

cd temp-juyo48-koto || exit 1

echo "Adding JT-48-1- prefix to all files..."
echo ""

count=0
# Process all files starting with 3 digits
for file in [0-9][0-9][0-9]*; do
  # Check if file exists and matches pattern
  if [ -f "$file" ]; then
    # Get the 3-digit number at the start
    num="${file:0:3}"
    # Get the rest of the filename
    rest="${file:3}"
    # Create new filename
    new_name="JT-48-1-${num}${rest}"

    # Rename the file
    mv "$file" "$new_name"
    count=$((count + 1))

    # Show progress every 20 files
    if [ $((count % 20)) -eq 0 ]; then
      echo "✓ Processed $count files..."
    fi
  fi
done

echo ""
echo "==========================================="
echo "Prefix addition complete!"
echo "==========================================="
echo ""
echo "Total files renamed: $count"
echo ""
echo "Sample results:"
ls | head -5
