import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { Capacitor } from '@capacitor/core'

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// Native app (Android) setup: hide splash screen once React has mounted,
// and match the status bar to the site's dark theme.
if (Capacitor.isNativePlatform()) {
  import('@capacitor/splash-screen').then(({ SplashScreen }) => {
    SplashScreen.hide().catch(() => {});
  });
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setBackgroundColor({ color: '#0f0f11' }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  });

  // Android hardware back button: go back in app history instead of exiting.
  import('@capacitor/app').then(({ App: CapApp }) => {
    CapApp.addListener('backButton', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  }).catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <App />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
)
