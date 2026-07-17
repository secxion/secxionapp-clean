# Secxion - Gradle Linking & Play Store Readiness

This plan addresses the difficulty in linking the new `android` folder as a Gradle project in Android Studio.

## User Review Required

> [!IMPORTANT]
> **Manual Import Step**: Since the "Link" option is missing, we will use the **"Import Module"** wizard. This is the most reliable way to force Android Studio to recognize a subfolder as a Gradle module.

## Proposed Changes

### Phase 1: Forcing Gradle Recognition

#### [ACTION] Import Module
Instead of right-clicking, I will guide you through the **Import Module** menu:
1.  Go to **File > New > Module from Existing Sources...**
2.  Navigate to and select the [**`android`**](file:///Users/mac/secxionapp-clean/android) folder.
3.  Choose **"Import module from external model"** and select **Gradle**.
4.  Click **Finish**.

#### [NEW] [gradlew](file:///Users/mac/secxionapp-clean/android/gradlew) & [gradlew.bat](file:///Users/mac/secxionapp-clean/android/gradlew.bat)
I will provide the official Gradle wrapper scripts. Having these files in the directory often triggers the IDE's auto-detection.

### Phase 2: SHA Fingerprints & Firebase

#### [ACTION] Signing Report
Once the module is imported:
1.  Open the **Gradle Tab**.
2.  Run **secxionapp-clean > android > Tasks > android > signingReport**.
3.  Copy the SHA-1 and SHA-256 codes.

## Verification Plan

### Manual Verification
1.  Verify the `android` folder has a blue "module" icon in the Project view.
2.  Verify the **Gradle tool window** is populated with tasks.
3.  Verify the `signingReport` task runs without errors.
