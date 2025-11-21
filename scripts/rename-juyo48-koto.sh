#!/bin/bash

# Script to rename Juyo 48 Koto files with proper numbering
# - Items 1-11: Add leading zeros (001-011)
# - Item 12: Missing (gap)
# - Items 13-20: Shift down to 012-019 (account for missing 12)
# - "001 Ryokai": Rename to 020
# - Items 21-140: Add leading zeros (021-140)

cd temp-juyo48-koto || exit 1

echo "Starting Juyo 48 Koto file renaming..."
echo ""

# Step 1: Move "001 Ryokai" to temporary name
echo "Step 1: Moving Ryokai to temporary name..."
mv "001 Ryokai.jpg" "TEMP_Ryokai.jpg"
mv "001 Ryokai.pdf" "TEMP_Ryokai.pdf"
echo "✓ Ryokai moved to TEMP"
echo ""

# Step 2: Rename items 1-11 with leading zeros
echo "Step 2: Renaming items 1-11 to 001-011..."
for i in {1..11}; do
  jpg_file=$(ls "${i} "*.jpg 2>/dev/null)
  pdf_file=$(ls "${i} "*.pdf 2>/dev/null)

  if [ -f "$jpg_file" ]; then
    name="${jpg_file#${i} }"
    new_num=$(printf '%03d' $i)
    mv "$jpg_file" "${new_num} ${name}"
    mv "$pdf_file" "${new_num} ${name%.jpg}.pdf"
    echo "✓ ${i} → ${new_num}"
  fi
done
echo ""

# Step 3: Rename items 13-20 to 012-019 (shift down by 1)
echo "Step 3: Renaming items 13-20 to 012-019..."
for i in {20..13}; do  # Reverse order to avoid conflicts
  jpg_file=$(ls "${i} "*.jpg 2>/dev/null)
  pdf_file=$(ls "${i} "*.pdf 2>/dev/null)

  if [ -f "$jpg_file" ]; then
    name="${jpg_file#${i} }"
    new_num=$((i - 1))
    new_num_padded=$(printf '%03d' $new_num)
    mv "$jpg_file" "${new_num_padded} ${name}"
    mv "$pdf_file" "${new_num_padded} ${name%.jpg}.pdf"
    echo "✓ ${i} → ${new_num_padded}"
  fi
done
echo ""

# Step 4: Rename TEMP_Ryokai to 020
echo "Step 4: Renaming Ryokai to 020..."
mv "TEMP_Ryokai.jpg" "020 Ryokai.jpg"
mv "TEMP_Ryokai.pdf" "020 Ryokai.pdf"
echo "✓ Ryokai → 020"
echo ""

# Step 5: Rename items 21-140 with leading zeros
echo "Step 5: Renaming items 21-140 with leading zeros..."
for i in {21..140}; do
  jpg_file=$(ls "${i} "*.jpg 2>/dev/null | head -1)
  pdf_file=$(ls "${i} "*.pdf 2>/dev/null | head -1)

  if [ -f "$jpg_file" ]; then
    name="${jpg_file#${i} }"
    new_num=$(printf '%03d' $i)

    # Skip if already has leading zeros
    if [ "$jpg_file" != "${new_num} ${name}" ]; then
      mv "$jpg_file" "${new_num} ${name}"
      mv "$pdf_file" "${new_num} ${name%.jpg}.pdf"
      echo "✓ ${i} → ${new_num}"
    fi
  fi
done
echo ""

echo "==========================================="
echo "Renaming complete!"
echo "==========================================="
echo ""
echo "Summary:"
echo "- Items 001-011: Ready ✓"
echo "- Item 012: MISSING (expected gap)"
echo "- Items 012-019: Renumbered from 13-20 ✓"
echo "- Item 020: Ryokai ✓"
echo "- Items 021-140: Ready ✓"
echo ""
echo "You can now copy these files back to:"
echo "C:\\Users\\chand\\Desktop\\Nihonto\\Juyo Zufu\\48\\Koto"
