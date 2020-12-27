
import React from 'react';


class MainPopup extends React.Component {
  constructor() {
    super();
    this.state = { 
      time:""      
     };
   
  }
  close(e,popup){
    console.log(e)
  }
    render() {
        return (
          <div tabIndex="0" className="mainPopupWrapper" onClick={this.props.closeMainPopup} onKeyPress={(e)=>this.close(e,this.props.closeRunOutPopup)}>
            <div className="popupContainer" onClick={(e)=>{e.stopPropagation()}} >
              <div className="closePopup"><button onClick={this.props.closeMainPopup}>&times;</button></div>
              <div className="header">Let's get focused</div>
              <div className="timeSelection" onClick={()=>{this.props.setTimer("15")}}>15 min</div>
              <div className="timeSelection" onClick={()=>{this.props.setTimer("30")}}>30 min</div>
              <div className="timeSelection" onClick={()=>{this.props.setTimer("45")}}>45 min</div>
              <form onSubmit={(e)=>{this.props.setTimer(this.state.time);e.preventDefault()}}>
              <div className="timeInputLabel">Enter your time</div>
              <input  className="timeInput" value={this.state.time}  onChange={(e)=>{this.setState({time:e.target.value})}} type="text"/>
              <button class="timerStart" onClick={()=>{this.props.setTimer(this.state.time)}}>START</button>
              </form>
              
            </div>  
          </div>  

        )
    }
}
export default MainPopup;