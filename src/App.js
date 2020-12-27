/*global chrome*/
import React, { Component } from 'react';
import Switch from "react-switch";
import logo from './happy-timer-logo.svg';
import iconsettings from './Icon-settings.svg';

import './App.css';


export default class App extends Component {
  constructor() {
    super();
    this.state = { 
      sidebarchecked: false,
      soundChecked:false,
      notificationChecked:false,
      timerRuned:false,
      startTime:"",
      timeLength:0,
      time:0
     };
    this.handleChangeSidebar = this.handleChangeSidebar.bind(this);
    this.handleChangeSound = this.handleChangeSound.bind(this);
    this.handleChangeNotification = this.handleChangeNotification.bind(this);
  }
  componentDidMount(){  
    chrome.storage.sync.get(['sidebarchecked','soundChecked','notificationChecked',"startTime","timerRuned","timeLength"], (result)=> {
      console.log(result.startTime,result.timerRuned,result.timeLength)
      this.setState({
        sidebarchecked: result.sidebarchecked,
        soundChecked:result.soundChecked,
        notificationChecked:result.notificationChecked,
        timerRuned:result.timerRuned,
        startTime:result.startTime,
        timeLength:result.timeLength*60,
        time:Date.now()
      })
     
      if((Date.now()-result.startTime)/60000<result.timeLength&&result.timerRuned){        
        this.startTimer()
      }
    });
  }

  startTimer(){
   let tim= setInterval(()=>{
      if((this.state.timeLength-((this.state.time-this.state.startTime)/1000))<=0){
        clearInterval(tim)
        return
      }
      this.setState({time:Date.now()})
      
    },1000);
  }


  handleChangeSidebar(sidebarchecked) {    
    chrome.storage.sync.set({sidebarchecked}, ()=> {
      chrome.runtime.sendMessage({event:"toggleSidebar"}, (response)=>{
        this.setState({ sidebarchecked });     
      });      
    });
    
  }

 
  handleChangeSound(soundChecked) {
    chrome.storage.sync.set({soundChecked}, ()=>{
      this.setState({ soundChecked });
    });
    
  }


  handleChangeNotification(notificationChecked) {
    chrome.storage.sync.set({notificationChecked}, ()=> {
      this.setState({notificationChecked });
    });
    
  }


  getSeconds(){
    let second=(60-Math.floor(((this.state.time-this.state.startTime)%(1000 * 60)) / 1000))
    return( second<10?"0"+second:second)    
  }

  getMinute(){
    let minute=Math.trunc((this.state.timeLength-((this.state.time-this.state.startTime)/1000))/60)
    return( minute<10?"0"+minute:minute)  
  }
  
  render() {
    return (
      <div className="popup_container">
        <div className="extensionLogo" style={{backgroundImage:`url(${chrome.runtime.getURL(logo)})` }}></div>
        <div className="extensionVersion">Version 1.0</div>
        <div className="extContent">
          <div className="row">
            <p className="text">Timer Sidebar Icon</p>
            <Switch 
              className="switch"
              height={17.5} 
              width={39.22} 
              offColor="#FDF1C3" 
              onColor='#FAD961'
              checkedIcon={false} 
              uncheckedIcon={false}
              onChange={this.handleChangeSidebar} 
              checked={this.state.sidebarchecked}
              >                
            </Switch>
          </div>
          <div className="row">
            <p className="text">Sound when the timer hits zero</p>
            <Switch 
              className="switch"
              height={17.5} 
              width={39.22} 
              offColor="#FDF1C3" 
              onColor='#FAD961'
              checkedIcon={false} 
              uncheckedIcon={false}
              onChange={this.handleChangeSound} 
              checked={this.state.soundChecked}
              >                
            </Switch>
          </div>
          <div className="row">
            <p className="text">Deskt
             notification when timer hits zero</p>
            <Switch 
              className="switch"
              height={17.5} 
              width={39.22} 
              offColor="#FDF1C3" 
              onColor='#FAD961'
              checkedIcon={false} 
              uncheckedIcon={false}
              onChange={this.handleChangeNotification} 
              checked={this.state.notificationChecked}
              >                
            </Switch>
          </div>
        </div>
        {console.log(this.state.timeLength, this.state.time,this.state.startTime)}
        <div className="middleContent">
          {
            (this.state.timerRuned&&((this.state.timeLength-((this.state.time-this.state.startTime)/1000))>0))?null:<p className="text">
            „The only permanent form of happiness lies in the consciousness of productivity.“
          </p>
          }
          {
            (this.state.timerRuned&&((this.state.timeLength-((this.state.time-this.state.startTime)/1000))>0))?
            <p className="timeRuned">
            Timer:&nbsp;
            {this.getMinute()}: 
            {this.getSeconds()}            
          </p>:null
          }
          <p class="author">- Carl Zuckmayer</p>
        </div>
        <div className="feedbackContainer">
          <a className="feedbackLink" href="https://airtable.com/shrpzD6EmFLs6R2sK" onClick={()=>{chrome.tabs.create({ 'url': 'https://airtable.com/shrpzD6EmFLs6R2sK' })}}>Send Feedback</a>
          <div className="settings" style={{backgroundImage:`url(${chrome.runtime.getURL(iconsettings)})` }} onClick={()=>{chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });}}></div>         
        </div> 
        
      </div> 
    );
  }
}

