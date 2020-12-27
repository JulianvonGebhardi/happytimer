import React from 'react';

class SideArrow extends React.Component {
  /*constructor(props) {
    super(props)
  }*/
    render() {
      //onClick={()=>{this.props.closeAll()}}
      
        return (            
          <div className="sideIcon arrowContainer" id="side-arrow-1" draggable="true" onMouseMove={(e)=>{this.props.getCurrentPosition(e)}} onMouseDown={(e)=>{this.props.startPosition(e)}} onMouseUp={(e)=>{this.props.mouseUp(e)}} >    
          {
             !this.props.isOpen? 
             <svg xmlns="http://www.w3.org/2000/svg" width="13.503" className="arrowIcon" height="23.619" viewBox="0 0 13.503 23.619" onClick={(e)=>{this.props.openMainPopup(e)}}
             >               
                <path d="M15.321,18l8.937-8.93a1.688,
                1.688,0,0,0-2.391-2.384L11.742,16.8a1.685,1.685,0,0,0-.049,2.327L21.86,29.32a1.688,1.688,0,0,0,2.391-2.384Z" 
                transform="translate(-11.251 -6.194)"/>
            </svg> :null
          }          
            
            
           {
               this.props.isOpen?
               <svg draggable="true" className="arrowBackIcon" xmlns="http://www.w3.org/2000/svg" width="13.503" height="23.619" viewBox="0 0 13.503 23.619" onClick={()=>{this.props.closeAll()}}>                
                <g transform="translate(13.503 23.619) rotate(180)">
                    <path draggable="true" class="a" d="M15.321,18l8.937-8.93a1.688,1.688,0,0,0-2.391-2.384L11.742,16.8a1.685,.685,0,0,0-.049,2.327L21.86,29.32a1.688,1.688,0,0,0,2.391-2.384Z"
                    transform="translate(-11.251 -6.194)"/>
                </g>
            </svg> :null
           }         
          </div>          
        )
    }
}
export default SideArrow;