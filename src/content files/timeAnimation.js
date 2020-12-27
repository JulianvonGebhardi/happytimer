
import React from 'react';

class TimeAnimation extends React.Component {
    constructor() {
        super();
        this.state = { 
          timerRuned:false,
          startTime:"",
          timeLength:0,
          time:0         
         };   
      }
      
      
    
      
    render() {
      
        return (
          <div style={{opacity:this.props.op}} className="timeAnimation">              
              {this.props.time}       
          </div>          
        )
    }
}
export default TimeAnimation;