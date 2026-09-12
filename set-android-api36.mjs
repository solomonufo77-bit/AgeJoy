import fs from 'node:fs';
const file = 'android/variables.gradle';
if (!fs.existsSync(file)) {
  throw new Error('Android project not found. Run npm run cap:add:android first.');
}
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 36');
text = text.replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 36');
if (!/compileSdkVersion\s*=\s*36/.test(text)) text += '\next { compileSdkVersion = 36 }\n';
if (!/targetSdkVersion\s*=\s*36/.test(text)) text += '\next { targetSdkVersion = 36 }\n';
fs.writeFileSync(file, text);
console.log('AgeJoy Android API levels set: compileSdk 36, targetSdk 36');
