import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider } from './hooks/useAppState';
import App from './App';
import { EventListPage } from './pages/EventListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { NewEventPage } from './pages/NewEventPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
