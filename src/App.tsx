import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">Points Tracker</Link>
        <Link to="/settings" className="settings-link" title="Settings">
          ⚙
        </Link>
      </header>

      {!isHome && location.pathname !== '/settings' && (
        <nav className="back-nav">
          <Link to="/">← Back</Link>
        </nav>
      )}

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
