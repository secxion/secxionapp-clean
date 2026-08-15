# Google Play Store Release & Launch Plan for Secxion

Prepare and build the production-ready Android App Bundle (`.aab`), configure release signing, verify Digital Asset Links (TWA verification), and checklist all Google Play Console launch requirements.

## User Review Required

> [!IMPORTANT]
> To launch on the Google Play Store, Google requires an Android App Bundle (`.aab`) signed with a release keystore, as well as Digital Asset Links hosted on `https://secxion.com/.well-known/assetlinks.json`.

> [!WARNING]
> Please confirm if you already have an existing upload keystore (`.jks` or `.keystore`) and `signing.properties`, or if we should generate a new release keystore for your Google Play Console app signing.

## Proposed Steps

### 1. Release Keystore & Signing Configuration
- Check/generate release upload keystore (`secxion-release-key.jks`) using `keytool`.
- Create `android/signing.properties` containing keystore location, passwords, and key alias.
- Extract the SHA-256 fingerprint from the release keystore.

### 2. Digital Asset Links & TWA Verification
- Update `android/app/src/main/res/values/strings.xml` and `.well-known/assetlinks.json` with the production release keystore SHA-256 fingerprint (and Google Play App Signing certificate SHA-256 once uploaded).
- Ensure `https://secxion.com/.well-known/assetlinks.json` is served with `Content-Type: application/json` on your production web server.

### 3. App Bundle Build
- Execute Gradle task `:app:bundleRelease` to generate `app-release.aab`.
- Verify bundle integrity and target API level (`targetSdk 34`).

### 4. Google Play Console Listing Checklist
- App Name: Secxion
- Short description (up to 80 chars) & Full description (up to 4000 chars)
- High-res app icon (512x512 PNG), Feature graphic (1024x500 PNG)
- Phone screenshots (at least 2, 16:9 or 9:16 aspect ratio)
- Privacy Policy URL (`https://secxion.com/privacy`)
- App content declarations (Financial Features, Target audience, Data safety)

---

## Verification Plan

### Automated / Build Verification
- Run `./gradlew :app:bundleRelease` to ensure the release `.aab` builds cleanly without signing or ProGuard issues.
- Verify SHA-256 fingerprint matches between keystore and `assetlinks.json`.

### Manual / Play Console
- Upload the generated `app-release.aab` to Google Play Console (Internal Testing track or Production track).
