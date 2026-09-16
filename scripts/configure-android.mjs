import fs from 'node:fs';

const variables = 'android/variables.gradle';
const manifest = 'android/app/src/main/AndroidManifest.xml';
const buildGradle = 'android/app/build.gradle';

if (!fs.existsSync(variables) || !fs.existsSync(manifest)) {
  throw new Error(
    'Android project not found. Run npx cap add android first.'
  );
}

// Configure Android SDK versions
let gradle = fs.readFileSync(variables, 'utf8');

gradle = gradle.replace(
  /compileSdkVersion\s*=\s*\d+/g,
  'compileSdkVersion = 36'
);

gradle = gradle.replace(
  /targetSdkVersion\s*=\s*\d+/g,
  'targetSdkVersion = 36'
);

fs.writeFileSync(variables, gradle);

// Remove unnecessary permissions
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
  const escaped = permission.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );

  xml = xml.replace(
    new RegExp(
      `\\s*<uses-permission[^>]+android:name=["']${escaped}["'][^>]*/>\\s*`,
      'g'
    ),
    '\n'
  );
}

fs.writeFileSync(manifest, xml);

// Verify unnecessary permissions are removed
const remaining = unwanted.filter(
  (permission) =>
    xml.includes(`android:name="${permission}"`) ||
    xml.includes(`android:name='${permission}'`)
);

if (remaining.length > 0) {
  throw new Error(
    'Unnecessary Android permissions remain: ' +
      remaining.join(', ')
  );
}

// Configure release signing
if (fs.existsSync(buildGradle)) {
  let appGradle = fs.readFileSync(buildGradle, 'utf8');

  const signingConfig = `
    signingConfigs {
        release {
            storeFile file("../agejoy-upload-key.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
`;

  if (!appGradle.includes('signingConfigs {')) {
    appGradle = appGradle.replace(
      /android\s*\{/,
      (match) => match + signingConfig
    );
  }

  if (!appGradle.includes('signingConfig signingConfigs.release')) {
    appGradle = appGradle.replace(
      /release\s*\{/,
      (match) => match + `
            signingConfig signingConfigs.release
`
    );
  }

  fs.writeFileSync(buildGradle, appGradle);
}

console.log(
  'AgeJoy configured for compileSdk 36 / targetSdk 36 with release signing.'
);
