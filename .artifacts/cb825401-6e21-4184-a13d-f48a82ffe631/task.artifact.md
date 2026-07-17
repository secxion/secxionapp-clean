# Task: Launch Secxion on Play Store (Android TWA Implementation)

- [x] Initialize Android Project Structure
    - [x] Create `android/` directory and root `build.gradle`
    - [x] Create `android/app/build.gradle` with TWA dependencies
    - [x] Create `AndroidManifest.xml` with TWA intent filters
- [x] Configure TWA for `https://secxion.com`
    - [x] Set up `res/values/strings.xml` with app name and URL
    - [x] Configure `res/values/colors.xml` to match web theme
- [x] Implement Native Experience
    - [x] Add Android 12+ Splash Screen support
    - [x] Configure Adaptive Icons (Using default Android XR/Material template)
- [x] Set up Firebase & Play Store Integration
    - [x] Generate SHA-1 and SHA-256 fingerprints
    - [x] Configure `assetlinks.json` in web project (`frontend/public/.well-known/`)
    - [x] Verify `google-services.json` is in `android/app/`
    - [x] Add Firebase SDK to Gradle files
    - [x] Add Firebase Messaging service to Manifest
- [ ] Play Store Verification
    - [ ] Verify `assetlinks.json` deployment on `https://secxion.com`
