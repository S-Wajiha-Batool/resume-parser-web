import React, {useContext} from 'react'
import { BrowserRouter as Router } from 'react-router-dom';
import { DataProvider } from './GlobalState';
import MainPages from './PageRoutes';
import './App.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

function App() {

  return (
    <DataProvider>
      <Router>
        <div className="App">
          <MainPages className='mainpage'/>
        </div>
        <ToastContainer/>
      </Router>
    </DataProvider>
  );
}

export default App;