import fs from 'fs';
import path from 'path';

const androidDir = path.resolve('android');
const variablesFile = path.join(androidDir, 'variables.gradle');

if (!fs.existsSync(androidDir)) {
  console.log('Android directory does not exist yet. Skipping API 36 configuration.');
  process.exit(0);
}

if (fs.existsSync(variablesFile)) {
  let content = fs.readFileSync(variablesFile, 'utf8');

  content = content
    .replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 36')
    .replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 36')
    .replace(/compileSdk\s*=\s*\d+/g, 'compileSdk = 36')
    .replace(/targetSdk\s*=\s*\d+/g, 'targetSdk = 36');

  fs.writeFileSync(variablesFile, content);
  console.log('AgeJoy configured for compileSdk 36 / targetSdk 36.');
} else {
  console.log('variables.gradle not found. Android project may not have been generated yet.');
}
