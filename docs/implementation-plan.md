# Implementation Plan — FYCS / BNN CS Study Hub

Covers 3 items:
1. Compress screenshot before attaching in Admin Settings notification mail
2. PWA (offline-first, instant app-shell load)
3. Fix the login-page flash on refresh

---

## 1. Image Compression — `AdminSettings.jsx` (notification mail attachment)

### Current behavior
`handleImageUploadForEmail` in `src/components/admin/AdminSettings.jsx` reads the
selected file straight into base64 via `FileReader`, only guards against files
`> 2MB`, and uploads the raw file to imgbb. No resizing/re-encoding happens, so a
1.5–2MB PNG screenshot goes out as-is — slower upload and a heavier email for
recipients.

### Change
Compress client-side with a `<canvas>` before upload: downscale to a sane max
width and re-encode as JPEG at reduced quality. This can safely raise the size
limit too, since the final upload will be much smaller regardless of the
original.

**New helper (add above `handleImageUploadForEmail`):**

```javascript
const compressImage = (file, maxWidth = 1280, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64.split(',')[1]); // base64 payload only
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

**Updated `handleImageUploadForEmail`:**

```javascript
const handleImageUploadForEmail = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) { // relaxed limit, compression handles the rest
    toast.error("Screenshot must be under 5MB.");
    e.target.value = '';
    return;
  }

  const loadingToast = toast.loading("Compressing & uploading screenshot...");
  setIsUploadingImg(true);

  try {
    const base64Image = await compressImage(file, 1280, 0.7);

    const formData = new FormData();
    formData.append('image', base64Image);

    const imgbbKey = import.meta.env.VITE_IMGBB_KEY;
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    if (result.success) {
      const imgHtml = `<br/><br/><img src="${result.data.url}" alt="Admin Screenshot" style="max-width:100%; height:auto; border-radius:8px; border:1px solid #333;" /><br/>`;
      setEmailMessage((prev) => prev + imgHtml);
      toast.success("Screenshot compressed & attached successfully!", { id: loadingToast });
    } else {
      throw new Error("ImgBB server rejected image");
    }
  } catch (err) {
    toast.error("Upload failed.", { id: loadingToast });
  } finally {
    setIsUploadingImg(false);
    e.target.value = '';
  }
};
```

### Expected result
- Typical phone screenshot (2–3MB PNG) → ~150–400KB JPEG after compression
- Faster upload to imgbb, lighter email for recipients
- `maxWidth`/`quality` are tunable if screenshots still look too heavy or too soft

### Checklist
- [ ] Add `compressImage` helper to `AdminSettings.jsx`
- [ ] Replace body of `handleImageUploadForEmail` with the compressed-upload flow
- [ ] Bump the pre-upload size guard from 2MB → 5MB
- [ ] Manually test with one large PNG screenshot and confirm final imgbb URL loads correctly in a real email client

---

## 2. PWA — Offline-first / instant app-shell load

### Why
`src/firebase.js` already does the two things that make *data* fast on refresh:
- `browserLocalPersistence` → login session survives refresh
- `persistentLocalCache` + `persistentMultipleTabManager` → Firestore data
  cached in IndexedDB, so `onSnapshot` fires near-instantly on refresh

What's missing is caching of the **app shell itself** (JS/CSS/HTML bundles).
Right now every visit still has to fetch those from the network before React
can even mount — that's the part that's slow on bad connections. A Service
Worker fixes this by serving the shell straight from cache and updating it
quietly in the background.

### Steps

1. **Install the plugin**
   ```bash
   npm install vite-plugin-pwa -D
   ```

2. **Update `vite.config.js`** — add the plugin alongside the existing
   `manualChunks` config (don't remove that, both can coexist):
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
           // Firestore/Google APIs are already handled by the SDK's own
           // IndexedDB cache — don't let Workbox intercept those requests.
           navigateFallbackDenylist: [/^\/__/],
         },
         manifest: {
           name: 'BNN CS Study Hub',
           short_name: 'CS Study Hub',
           theme_color: '#000000',
           background_color: '#0a0a0a',
           display: 'standalone',
           start_url: '/',
           icons: [
             { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
             { src: 'logo512.png', sizes: '512x512', type: 'image/png' },
           ],
         },
       }),
     ],
     server: {
       host: true,
       port: 5173,
     },
     build: {
       rollupOptions: {
         output: {
           manualChunks(id) {
             if (id.includes('node_modules')) {
               if (id.includes('firebase')) return 'vendor-firebase';
               if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
               if (id.includes('lucide-react')) return 'vendor-icons';
               return 'vendor';
             }
           }
         }
       },
       chunkSizeWarningLimit: 1000,
     }
   })
   ```

3. **Icons**: add `logo192.png` and `logo512.png` to `public/` (reuse/resize
   the existing `public/logo.png`).

4. **No manual registration needed** — `vite-plugin-pwa` with
   `registerType: 'autoUpdate'` injects the service-worker registration
   automatically at build time; nothing to add in `main.jsx`.

5. **Update flow**: on every new deploy, the service worker detects the new
   precache manifest hash in the background and swaps in the new version on
   the next navigation — no user action needed.

### Known interaction to verify
- The app uses `HashRouter` (see `main.jsx`) — this is actually PWA-friendly
  since there's no server-side routing to worry about; `navigateFallback`
  isn't a concern the way it would be with `BrowserRouter`.
- Firestore data offline behavior is unchanged by this — `persistentLocalCache`
  already handles that independently. The service worker only owns the JS/CSS/
  HTML shell.
- Fully offline + no cached Firestore data yet (first-ever visit with no
  network) will still show empty state — that's expected and unrelated to this
  change.

### Checklist
- [ ] `npm install vite-plugin-pwa -D`
- [ ] Add `VitePWA(...)` block to `vite.config.js`
- [ ] Add `logo192.png` / `logo512.png` to `public/`
- [ ] `npm run build && npm run preview`, then test in DevTools → Application →
      Service Workers (confirm it's registered and "activated")
- [ ] Test: load once online, then go offline (DevTools → Network → Offline),
      refresh — app shell should still render
- [ ] Test on a throttled connection (DevTools → Network → Slow 3G) — shell
      should paint near-instantly instead of waiting on the full JS bundle

---

## 3. Login-page flash on refresh

### Root cause (confirmed in code, not hypothetical)
`AppContext.jsx`'s auth `useEffect` already does the right thing *in the
common case*:

```
authReady (persistence) → getRedirectResult → onAuthStateChanged → (if user) fetch user doc → setAuthLoading(false)
```

`App.jsx` correctly gates on this:
```javascript
if (loading) return <AppSkeleton />;
...
if (!user && !isPublicRoute) return <Login />;
```

So on a normal refresh, the skeleton shows — not the login page — while auth
resolves. **However**, there's an explicit 8-second safety-net timeout in
`AppContext.jsx`:

```javascript
const authTimeout = setTimeout(() => {
  if (isMounted) {
    setAuthLoading((prev) => { ... return false; });
  }
}, 8000);
```

Its own comment states the trade-off directly: *"worst case it briefly shows
the logged-out/Login view until the real auth state catches up a moment
later."* If `onAuthStateChanged` hasn't fired yet when this timeout forces
`authLoading` to `false` (slow IndexedDB read, tab lock contention across
multiple open tabs, throttled network, cold cache), `user` is still `null` →
`App.jsx` renders `<Login />` → moments later the real auth state arrives →
`<Login />` unmounts, main app mounts. That's the flash the user is seeing.

Note: 8s is a long window for this to trigger under normal conditions — if the
flash is happening reliably and quickly (not just occasionally on a bad
connection), it's worth confirming it isn't actually the **route-level**
`Suspense` fallback (`AppSkeleton`/`RouteSuspenseFallback`) being mistaken for
the flash instead, since those also render briefly on every refresh by design.

### Fix
Two changes, both in `src/context/AppContext.jsx`:

1. **Shorten the safety-net timeout** from 8s to something closer to typical
   worst-case IndexedDB/network latency (e.g. 3s), so if it *does* fire, the
   window where a wrong `<Login />` could flash is much smaller.

2. **Don't let the timeout force a false "logged out" state** — instead of
   blindly setting `authLoading` to `false` (which lets `App.jsx` conclude
   "no user"), add a separate `authTimedOut` flag and use it only to render a
   neutral "taking longer than usual" state, not the Login page, until
   `onAuthStateChanged` actually reports back:

   ```javascript
   const [authTimedOut, setAuthTimedOut] = useState(false);

   // inside the effect:
   const authTimeout = setTimeout(() => {
     if (isMounted) {
       setAuthTimedOut(true);
       // still don't flip authLoading here — let onAuthStateChanged do that
     }
   }, 3000);
   ```

   Then in `App.jsx`, only fall through to `<Login />` once you're sure
   `onAuthStateChanged` has actually reported "no user" — not just "we gave
   up waiting." In practice this means keeping `loading` as the sole gate
   (as today) but treating `authTimedOut` as a UI hint (e.g. "still checking
   your session…" text on `AppSkeleton`) rather than a trigger to unblock into
   `<Login />` with an unresolved `user`.

3. **Optional hardening**: `persistentMultipleTabManager` in `firebase.js`
   already reduces the "IndexedDB lock contention across tabs" case mentioned
   in the safety-net comment, since tabs share one cache instead of fighting
   over a lock — so the most likely remaining trigger is genuinely slow/cold
   network on first load, which the 3s-vs-8s change addresses directly.

### Checklist
- [ ] Reduce `authTimeout` from `8000` to `3000` in `AppContext.jsx`
- [ ] Add `authTimedOut` state, stop using the timeout to force `authLoading`
      to `false`
- [ ] Confirm `<AppSkeleton />` (not `<Login />`) is what shows during the
      timed-out-but-still-resolving window
- [ ] Test: throttle network to "Slow 3G" in DevTools, hard refresh while
      logged in, confirm no Login flash before the main app appears
- [ ] Test normal-speed refresh (regression check) — should be unaffected

---

## Suggested order of implementation
1. Image compression (isolated, low risk, quick win)
2. Auth-flash fix (isolated to `AppContext.jsx`/`App.jsx`, no new dependencies)
3. PWA (touches build config + adds a dependency — do last, test thoroughly
   with `npm run preview` before deploying)
