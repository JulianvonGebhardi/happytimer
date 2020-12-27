
/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom';
import App from './content files/app'
import poppins_regular from './fonts/Poppins-Regular.ttf'
import './index.css';

const style = document.createElement('style');
style.type = 'text/css';
style.textContent = '@font-face { font-family: poppins; src: url("'
        + chrome.runtime.getURL(poppins_regular)
        + '"); }';        
document.head.appendChild(style);
const timer = document.createElement('div');
timer.id = "mainTimer";
document.body.appendChild(timer)
ReactDOM.render(<App />, timer);

