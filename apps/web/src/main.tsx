import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import '@fontsource-variable/atkinson-hyperlegible-next';
import '@fontsource-variable/atkinson-hyperlegible-mono';
import '@fontsource-variable/shantell-sans';
import './style.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
