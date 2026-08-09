/**
 * content.js - Entry point for content script
 * Injects the timer UI into web pages
 */

/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './content/app';
import poppinsRegular from './fonts/Poppins-Regular.ttf';
import './index.css';

// Load font
const style = document.createElement('style');
style.type = 'text/css';
style.textContent = `@font-face { 
  font-family: poppins; 
  src: url("${chrome.runtime.getURL(poppinsRegular)}"); 
}`;
document.head.appendChild(style);

// Create container for timer
const timerContainer = document.createElement('div');
timerContainer.id = 'mainTimer';
document.body.appendChild(timerContainer);

// Render the app
ReactDOM.render(<App />, timerContainer);
