import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AppStateProvider } from './hooks/useAppState';
import App from './App';
import { EventListPage } from './pages/EventListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { NewEventPage } from './pages/NewEventPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

const SW_CHECK_INTERVAL = 60 * 1000; // check for updates every 60s

function PWAUpdater() {
  useRegisterSW({
    onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, SW_CHECK_INTERVAL);
      }
    },
  });
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PWAUpdater />
    <HashRouter>
      <AppStateProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<EventListPage />} />
            <Route path="event/:id" element={<EventDetailPage />} />
            <Route path="new-event" element={<NewEventPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AppStateProvider>
    </HashRouter>
  </StrictMode>
);
