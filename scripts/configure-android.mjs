import fs from 'node:fs';

const variables = 'android/variables.gradle';
const manifest = 'android/app/src/main/AndroidManifest.xml';

if (!fs.existsSync(variables) || !fs.existsSync(manifest)) {
  throw new Error('Android project not found. Run npx cap add android first.');
}

let gradle = fs.readFileSync(variables, 'utf8');
gradle = gradle.replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 36');
gradle = gradle.replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 36');
fs.writeFileSync(variables, gradle);

const unwanted = [
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_PHONE_STATE',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.MANAGE_EXTERNAL_STORAGE',
  'android.permission.BLUETOOTH',
  'android.permission.BLUETOOTH_ADMIN',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.BLUETOOTH_SCAN',
  'android.permission.NFC',
  'android.permission.ACCESS_WIFI_STATE',
  'android.permission.CHANGE_WIFI_STATE',
  'android.permission.NEARBY_WIFI_DEVICES',
  'android.permission.RECEIVE_BOOT_COMPLETED'
];

let xml = fs.readFileSync(manifest, 'utf8');
for (const permission of unwanted) {
  const escaped = permission.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  xml = xml.replace(
    new RegExp(String.raw`\\s*<uses-permission[^>]+android:name=["']${escaped}["'][^>]*/>\\s*`, 'g'),
    '\n'
  );
}

fs.writeFileSync(manifest, xml);

const remaining = unwanted.filter(
  p => xml.includes(`android:name="${p}"`) || xml.includes(`android:name='${p}'`)
);

if (remaining.length) throw new Error('Unnecessary Android permissions remain: ' + remaining.join(', '));

console.log('AgeJoy configured for compileSdk 36 / targetSdk 36.');
