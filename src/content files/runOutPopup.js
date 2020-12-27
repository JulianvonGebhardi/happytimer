import React from 'react';

class RunOutPopup extends React.Component {
  constructor() {
    super();
    this.state = { 
      time:""      
     };
   
  }
  close(e,popup){
    popup()
  }
    render() {
        return (
          <div className="runOutPopupWrapper" onClick={this.props.closeRunOutPopup}>
            <div className="popupContainer" onClick={(e)=>{e.stopPropagation()}} onKeyDown={(e)=>this.close(e,this.props.closeRunOutPopup)}>
              <div className="closePopup"><button onClick={this.props.closeRunOutPopup}>&times;</button></div>
              <div className="header">Your time has run out</div>
              <div className="content">
                <div>
                  Great work! 
                </div>
                <div>Your focus session is over.</div>
              </div>
              <div className="actionContainer">
                <div>
                  <div className="text">
                    I am in a flow
                  </div>
                  <button onClick={this.props.addAnother}>Another Round</button>
                </div>
                <div>
                  <div className="text">
                    Time for a break
                  </div>
                  <button onClick={this.props.closeRunOutPopup}>Stop & Close</button>
                </div>
              </div>

            </div>  
          </div>  

        )
    }
}
export default RunOutPopup;