# FYCS Study Hub — Android App (Capacitor Build)

## How updates work — IMPORTANT

I've configured the app to load your **live website directly**
(`https://fycs-study-hub.vercel.app`) instead of a bundled copy of the
code. This means:

- **Any change you push to GitHub → Vercel auto-deploys → the app shows
  it immediately**, the next time it's opened. No rebuilding, no new
  APK, no reinstalling. This is exactly how your college's app works
  (it's also just a native wrapper around their website).
- The app needs an internet connection to load (same as your website
  already needs, since Firebase requires internet anyway).
- You only need to rebuild the APK again if you change something
  **native** — like the app icon, splash screen, or app name — not for
  regular website code changes.

If you ever want the opposite behavior (app works fully offline with a
snapshot of the code, updates only when you manually rebuild), open
`capacitor.config.ts` and remove the `server.url` line, then run
`npm run build && npx cap sync android` again — it'll go back to loading
the bundled local copy from `dist/`.

## What I did

Your website has been wrapped as a **native Android app using Capacitor** —
this is the industry-standard way to turn a web app into a real Android app
**without rewriting anything**. It's the same React app, same Firebase, same
UI, same everything — just running inside a native Android shell (WebView)
so it installs and launches like a normal app.

Changes made (all inside this same project, nothing removed):
- Added `@capacitor/core`, `@capacitor/android`, and the `android/` native
  project folder (already generated — this is your real Android Studio
  project).
- Added `capacitor.config.ts` — app ID `com.fycsstudyhub.app`, app name
  "FYCS Study Hub".
- Generated a **native app icon** and **splash screen** from your existing
  `public/logo.png`, matching your site's dark theme (`#0f0f11`).
- Added the Android hardware **back button** handler (goes back in app
  history instead of closing the app).
- Added status bar theming (dark, matches your site background).
- `HashRouter` was already used in `main.jsx` — that's exactly what's
  needed for routing to work correctly inside the app. No changes needed
  there.

## What YOU need to do (Android Studio required)

I can't produce the final `.apk`/`.aab` file from here — that step needs the
Android SDK + Gradle, which only runs inside Android Studio on your machine.
Everything else is already done. Steps:

1. **Install Android Studio** (if not already): https://developer.android.com/studio
2. Unzip this project, open a terminal inside the folder, run:
   ```
   npm install
   npm run build
   npx cap sync android
   ```
3. Open the `android` folder in Android Studio:
   ```
   npx cap open android
   ```
   (or manually: Android Studio → Open → select the `android` folder)
4. Let Gradle sync finish (first time may take a few minutes, downloads
   the Android build tools).
5. To test on your phone: enable USB debugging on your phone, connect it,
   and press ▶ Run in Android Studio.
6. To build an installable APK: **Build → Build Bundle(s)/APK(s) → Build
   APK(s)**. The APK will appear in
   `android/app/build/outputs/apk/debug/app-debug.apk` — copy this to
   your phone and install it (you'll need to allow "install from unknown
   sources").
7. For a Play Store–ready release build (signed `.aab`): **Build →
   Generate Signed Bundle / APK**, and follow the signing key wizard.

## ⚠️ One thing to watch: Google Sign-In

Your app already has smart handling for this (`signInWithPopup` falling
back to `signInWithRedirect` in `AppContext.jsx`), which covers most
WebView cases. But Google sometimes blocks OAuth sign-in entirely inside
embedded WebViews for security reasons ("This browser or app may not be
secure"). If you hit that on a real device:
- Easiest fix: test it first — Capacitor's WebView (Android System
  WebView) is often accepted, so it may just work.
- If blocked: I can add the `@capacitor/browser` plugin to open Google
  sign-in in the system Chrome browser instead (a few more steps, need
  Firebase Console → add an Android OAuth client with your Android app's
  SHA-1 fingerprint). Ask me and I'll wire that in.

## Whenever you update the website code

Every time you change anything in `src/`, rebuild the Android app with:
```
npm run build
npx cap sync android
```
then re-run/re-build from Android Studio. You do **not** need to redo any
of the setup above — it only needs to be done once.
