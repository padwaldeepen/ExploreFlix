import { AppBar } from './layouts/AppBar';
import { AppRoutes } from './routes/AppRoutes';
import './styles/globals.scss';

function App() {
  return (
    <div className="app">
      <AppBar />
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
