const sharp = require('sharp');
const fs = require('fs');

async function convertIcon() {
  // Normal icon (black sound wave, transparent background)
  const svgBuffer = fs.readFileSync('./resources/tray-icon.svg');

  await sharp(svgBuffer)
    .resize(22, 22)
    .png()
    .toFile('./resources/trayTemplate.png');

  await sharp(svgBuffer)
    .resize(44, 44)
    .png()
    .toFile('./resources/trayTemplate@2x.png');

  // Recording icon (white sound wave on orange background)
  const svgRecordingBuffer = fs.readFileSync('./resources/tray-icon-recording.svg');

  await sharp(svgRecordingBuffer)
    .resize(22, 22)
    .png()
    .toFile('./resources/tray-recording.png');

  await sharp(svgRecordingBuffer)
    .resize(44, 44)
    .png()
    .toFile('./resources/tray-recording@2x.png');

  console.log('✅ Menubar icons created successfully!');
  console.log('   Normal icons:');
  console.log('   - trayTemplate.png (22x22)');
  console.log('   - trayTemplate@2x.png (44x44)');
  console.log('   Recording icons:');
  console.log('   - tray-recording.png (22x22)');
  console.log('   - tray-recording@2x.png (44x44)');
}

convertIcon().catch(console.error);
