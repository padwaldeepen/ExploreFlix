import './App.css';
import { CustomRoutes } from './routes';
import {ResponsiveAppBar} from './pages/AppBar/AppBar';

function App() {
  return (
    <div>
    <ResponsiveAppBar/>
    <CustomRoutes/>
    </div>
  );
}

export default App;
