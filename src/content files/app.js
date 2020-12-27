/*global chrome*/
import React from 'react';
import SideTimer from './sideTimer';
import MainPopup from './mainPopup';
import RunOutPopup from './runOutPopup';
import TimeRuning from "./timeRuning";
import TimeAnimation from "./timeAnimation"
import SideArrow from "./sideArrow";
import alertWav from "../alert.wav";
export default class App extends React.Component {
    constructor() {
        super()
        this.state={
            sideTimer:false,                        
            mainPopup:false,
            timeRuning:false,
            runOut:false,
            timerRuned:false,
            startTime:"",
            timeLength:0,
            time:0  ,
            mouseStart: null,
            mouseCurrent: null,
            mouseDiff: 0,
            mouseDown: false,
            lastHeight: null,
            mouseLastStart: null,
            mousePressed: false,
        }
    }

    componentDidMount(){
        this.checkTimer()
        chrome.runtime.onMessage.addListener(            
            (request, sender, sendResponse)=> {
                if(request.event === "toggleSidebar"){
                    this.checkTimer()
                }
                else if(request.event === "alert"){
                    this.closeMainPopup()
                    this.closeTimeRuningPopup()
                    this.openRunOut()
                    this.alarmAlert();
                    this.setState({ timerRuned:false,})                    
                }
                else if(request.event === "finishTimer"){
                    this.closeMainPopup()
                    this.closeTimeRuningPopup()
                    this.openRunOut()
                    this.setState({ timerRuned:false})
                }
                return true
            }    
        );
        this.checkTime()
    }

    checkTimer=()=>{
        chrome.storage.sync.get(['sidebarchecked'], (result)=> {
            if(result.sidebarchecked){
                this.setState({sideTimer:true,})
            }
            else{
                this.setState({sideTimer:false,})
            }
            
        });
    }

    openMainPopup=(e)=>{
      e.preventDefault()
      if (this.state.mousePressed) { return }
        chrome.storage.sync.get(["timerRuned"], (result)=> {
            if (result.timerRuned){
                this.closeMainPopup()
                this.openTimeRuning();
            }   
            else{
                this.setState({mainPopup:true,isOpen:true})
            }  
        })
    }
    openTimeRuning=()=>{        
        this.setState({timeRuning:true,isOpen:true})   
    }

    openRunOut=()=>{    
        this.setState({runOut:true,isOpen:true})          
    }
    closeMainPopup=()=>{
         this.setState({mainPopup:false,isOpen:false});
    }
    closeRunOutPopup=()=>{
        this.setState({runOut:false,isOpen:false});
    }
    closeTimeRuningPopup=()=>{
        this.setState({timeRuning:false,isOpen:false}) 
    }
    closeAll=()=>{
        this.setState({timeRuning:false,runOut:false,mainPopup:false,isOpen:false}) 
    }

    roundTime=(time)=>{
        time=Number(time.replace(',','.'))
        return time<=1?1:Math.round(time)
    }
    setTimer=(time)=>{
        let currentTime=Date.now()    
        chrome.storage.sync.set({startTime:currentTime,timerRuned:true,timeLength:this.roundTime(time)}, ()=> {        
            this.closeMainPopup();
            this.checkTime()
        });    
    }

    addAnother=()=>{
        this.closeRunOutPopup();
        this.openMainPopup()
    }

    alarmAlert=()=>{
        let a=new Audio(chrome.runtime.getURL(alertWav))
            a.play()            
    }

    stopCloseTimeRuning=()=>{
        this.closeTimeRuningPopup();
        chrome.storage.sync.set({startTime:0,timerRuned:false,timeLength:0}, ()=> {         
        }); 
    }

    checkTime(){
        chrome.storage.sync.get(["startTime","timerRuned","timeLength"], (result)=> {      
          this.setState({
          
            timerRuned:result.timerRuned,
            startTime:result.startTime,
            timeLength:result.timeLength*60,
            time:Date.now(),
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
        let second=(60-Math.floor(((this.state.time-this.state.startTime)%(1000 * 60)) / 1000))-1
        return( second<10?"0"+second:second)    
      }
      getMinute(){
        let minute=Math.trunc((this.state.timeLength-((this.state.time-this.state.startTime)/1000))/60)
        return( minute<10?"0"+minute:minute)  
      }
      getOP(){
          let t=3*Math.round((this.state.time -this.state.startTime)/1000)>9?9:3*Math.round((this.state.time -this.state.startTime)/1000)
        return (9-t)/10
      }


      getCurrentPosition = (e) => {
        e.preventDefault();
        if (this.state.mouseDown) {
          if (!this.state.mousePressed) { this.setState({ mousePressed: true })}
          const el = e.target.closest('.sideIcon')
          this.setState({
              mouseCurrent: e.pageY
            })
          this.getMouseDiff()
          if (!this.state.lastHeight) {
            el.setAttribute("style", `top: calc((50% - 30px) - ${this.state.mouseDiff}px) !important;`)
          } else {
            el.setAttribute("style", `top: calc(((50% - 30px) - ${this.state.lastHeight}px) - ${this.state.mouseDiff}px) !important;`)
          }
      }
        return 
      }

      startPosition = (e) => {
        e.preventDefault(); // needed!
        
        const el = e.target.closest('.sideIcon')
        
        if (this.state.mouseDown === false) {

          if (!this.state.mouseStart) {
            this.setState({
              mouseStart: e.pageY,
              mouseCurrent: e.pageY
            })
          }
        
        this.setState({
            mouseDown: true,
          })

          setTimeout(() => {
            if (this.state.mouseDown) {
              el.classList.add("drag")
            }
          }, 150);

        return 
        }
        return 
      }

      mouseUp = (e) => {
        e.preventDefault();
        const el = e.target.closest('.sideIcon')
        el.classList.remove("drag")
        if (this.state.mouseDown === true) {
        const mouseLast = this.state.mouseDiff;
        const mouseStart = this.state.mouseStart
        this.setState({
          mouseLastStart: mouseStart,
          mouseStart: e.pageY,
          mouseDown: false,
          mouseEnd: mouseLast,
          mouseDiff: 0,
          lastHeight: this.state.lastHeight + this.state.mouseDiff,
        })  
        setTimeout(() => {
          this.setState({
            mousePressed: false
          })
        }, 100);
      }
      return 
    }

      getMouseDiff = () => {
        let start 
        if (!this.mouseEnd) {
          start = this.state.mouseStart
        } else {
          start = this.state.mouseCurrent
        }
        this.setState({
            mouseDiff:  (Number(start) - Number(this.state.mouseCurrent))*1.001
          })
        }
        

    render() {
        return (
            <div>
                {this.state.sideTimer?
                    <SideTimer  openMainPopup={this.openMainPopup} startPosition={this.startPosition} getCurrentPosition={this.getCurrentPosition} mouseUp={this.mouseUp} isOpen={this.state.isOpen}/>:null}
                {this.state.mainPopup?
                    <MainPopup closeMainPopup={this.closeMainPopup} 
                    setTimer={this.setTimer}/>:null}
                {this.state.timeRuning?
                    <TimeRuning stopClose={this.stopCloseTimeRuning} 
                    closeTimeRuningPopup={this.closeTimeRuningPopup} setTimer={this.setTimer}/>:null}
                {this.state.runOut?
                    <RunOutPopup closeRunOutPopup={this.closeRunOutPopup} addAnother={this.addAnother}/>:null}
                {!this.state.sideTimer?
                    <SideArrow draggable="true" startPosition={this.startPosition} getCurrentPosition={this.getCurrentPosition} mouseUp={this.mouseUp} openMainPopup={this.openMainPopup} closeAll={this.closeAll} isOpen={this.state.isOpen}/>:null}
                    {(this.state.timerRuned&&this.getOP()>0)?
                    <TimeAnimation time={this.getMinute()+":" + this.getSeconds()} op={this.getOP()}/>:null}
                    
            </div>  

        )
    }
}

