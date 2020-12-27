/*global chrome*/
import React from 'react';

class TimeRuning extends React.Component {
  constructor() {
    super();
    this.state = { 
      timerRuned:false,
      startTime:"",
      timeLength:0,
      time:0         
     };   
  }
  componentDidMount(){
    chrome.storage.sync.get(['sidebarchecked','soundChecked','notificationChecked',"startTime","timerRuned","timeLength"], (result)=> {      
      this.setState({
        sidebarchecked: result.sidebarchecked,
        soundChecked:result.soundChecked,
        notificationChecked:result.notificationChecked,
        timerRuned:result.timerRuned,
        startTime:result.startTime,
        timeLength:result.timeLength*60,
        time:Date.now(),
        timeValue:""
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
          <div className="timeRuningPopupWrapper" onClick={this.props.closeTimeRuningPopup}>
            <div className="popupContainer" onClick={(e)=>{e.stopPropagation()}}>
              <div className="closePopup"><button onClick={this.props.closeTimeRuningPopup}>&times;</button></div>
              <div className="header">Time is running</div>    
              <div className="timer">
                <p className="timeRuned">
                  Timer:&nbsp;
                  {this.getMinute()}: 
                  {this.getSeconds()}            
                </p>
              </div>
              <form onSubmit={(e)=>{this.props.setTimer(this.state.timeValue); this.props.closeTimeRuningPopup();e.preventDefault()}}>
                <div className="timeform">
                  <div className="timeInputLabel">Enter your time</div>                 
                  <input  className="timeInput" value={this.state.timeValue}  onChange={(e)=>{this.setState({timeValue:e.target.value})}} type="text"/>
                </div>
                <div className="timebuttons">
                  <button onClick={()=>{this.props.setTimer(this.state.timeValue); this.props.closeTimeRuningPopup()}}>Start</button>
                  <button onClick={this.props.stopClose}>Stop & Close</button>
                </div>
              </form>
              
            </div>  
          </div>  

        )
    }
}
export default TimeRuning;