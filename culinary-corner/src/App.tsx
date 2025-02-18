import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app">
                    <h1>Culinary Corner</h1>
                    {/* Routes will be added here */}
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
