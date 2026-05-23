import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Contact from './pages/Contact'
import Index from './pages/Index'
import Lgardeduc from './pages/Lgardeduc'
import Profil from './pages/Profil'
import Reservation from './pages/Reservation'
import Prestations from './pages/Prestations'
import Header from './components/Header'


const App = () => {
  return (
   <BrowserRouter>
   < Header/>
      <Routes>
        <Route path="/" element={< Index/>}></Route>
        <Route path="/index" element={< Index/>}></Route>
        <Route path="/lgardeduc" element={< Lgardeduc/>}></Route>
        <Route path="/prestations" element={< Prestations/>}></Route>
        <Route path="/contact" element={< Contact/>}></Route>
        <Route path="/reservations" element={< Reservation/>}></Route>
        <Route path="/profil" element={< Profil/>}></Route>
        <Route path="/auth" element={< Auth/>}></Route>
        <Route path="*" element={<h1>Not Found 404</h1>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;