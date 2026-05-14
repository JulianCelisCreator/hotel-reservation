import { useState } from 'react';
import Header from './components/Header';
import HotelInfoBar from './components/HotelInfoBar';
import IVANotice from './components/IVANotice';
import Gallery from './components/Gallery';
import BottomBar from './components/BottomBar';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [language] = useState<'es' | 'en'>('es');

  return (
    <div className="app">
      <Header language={language} />
      <Navigation />
      <HotelInfoBar />
      <IVANotice />
      <Gallery />
      <BottomBar />
    </div>
  );
}

export default App;
