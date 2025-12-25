#!/bin/bash

# Create a simple monochrome microphone icon for macOS menubar
# 22x22 pixels, black on transparent, template style

# Using ImageMagick to create a simple microphone glyph
convert -size 22x22 xc:transparent \
  -fill black \
  \( -size 8x12 xc:black -draw "roundrectangle 0,0,7,11,3,3" \) -geometry +7+3 -composite \
  \( -size 12x6 xc:transparent -fill none -stroke black -strokewidth 1.5 -draw "path 'M 2,0 Q 0,0 0,3 Q 0,6 2,6 L 10,6 Q 12,6 12,3 Q 12,0 10,0'" \) -geometry +5+12 -composite \
  \( -size 2x3 xc:black \) -geometry +10+18 -composite \
  \( -size 8x1.5 xc:black -draw "roundrectangle 0,0,7,1,0.5,0.5" \) -geometry +7+20 -composite \
  /Users/khaled/Documents/Development/elevenlabs-transcription/resources/trayTemplate.png

# Create @2x version (44x44)
convert /Users/khaled/Documents/Development/elevenlabs-transcription/resources/trayTemplate.png \
  -resize 44x44 \
  /Users/khaled/Documents/Development/elevenlabs-transcription/resources/trayTemplate@2x.png

echo "Menubar icons created!"
