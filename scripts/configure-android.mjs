
import fs from 'node:fs';

const variables = 'android/variables.gradle';
const manifest = 'android/app/src/main/AndroidManifest.xml';
const buildGradle = 'android/app/build.gradle';

if (
  !fs.existsSync(variables) ||
  !fs.existsSync(manifest) ||
  !fs.existsSync(buildGradle)
) {
  throw new Error(
    'Android project not found. Run npx cap add android first.'
  );
}

// Configure SDK versions
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

// Configure app/build.gradle
let appGradle = fs.readFileSync(buildGradle, 'utf8');

if (!/android\s*\{/.test(appGradle)) {
  throw new Error('Could not locate the Android block.');
}

// Explicitly configure compileSdk
if (/\bcompileSdk(?:Version)?\s+\d+/.test(appGradle)) {
  appGradle = appGradle.replace(
    /\bcompileSdk(?:Version)?\s+\d+/,
    'compileSdk 36'
  );
} else {
  appGradle = appGradle.replace(
    /android\s*\{/,
    (match) => `${match}\n    compileSdk 36`
  );
}

// Add release signing configuration
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

// Connect signing configuration to release build
const releasePattern = /(buildTypes\s*\{\s*release\s*\{)/;

if (!appGradle.includes('signingConfig signingConfigs.release')) {
  if (!releasePattern.test(appGradle)) {
    throw new Error(
      'Could not locate the Android release build type.'
    );
  }

  appGradle = appGradle.replace(
    releasePattern,
    '$1\n            signingConfig signingConfigs.release'
  );
}

fs.writeFileSync(buildGradle, appGradle);

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
  'android.permission.NEARBY_WIFI_DEVICES'
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

// Verify permissions are removed
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

console.log(
  'AgeJoy configured for compileSdk 36 / targetSdk 36 with release signing.'
);
                                
