import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainApp from './MainApp';

require('dotenv').config();

ReactDOM.render(<MainApp />, document.getElementById('root'));
