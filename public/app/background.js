/*global chrome*/
// Called when the user clicks on the browser action
/*chrome.browserAction.onClicked.addListener(function(tab) {
   // Send a message to the active tab
   chrome.tabs.query({active: true, currentWindow:true},function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
   });
});*/

 /*"background": {
    "scripts": ["app/background.js"]
  },
  "browser_action": {
    "default_popup": "index.html"
  },*/

/*chrome.manifest = chrome.app.getDetails();
var injectIntoTab = function (tab) {    
    var scripts = chrome.manifest.content_scripts[0].js;
    var i = 0, s = scripts.length;
    for( ; i < s; i++ ) {
        chrome.tabs.executeScript(tab.id, {
            file: scripts[i]
        });
    }
}
chrome.windows.getAll({
    populate: true
}, function (windows) {
    var i = 0, w = windows.length, currentWindow;
    for( ; i < w; i++ ) {
        currentWindow = windows[i];
        var j = 0, t = currentWindow.tabs.length, currentTab;
        for( ; j < t; j++ ) {
            currentTab = currentWindow.tabs[j];
            if(  currentTab.url.match(/(http|https):\/\//gi) ) {
                injectIntoTab(currentTab);
            }
        }
    }
});
*/
chrome.notifications.onClosed.addListener(()=>{
  chrome.storage.sync.set({startTime:0,timerRuned:false,timeLength:0}, ()=> {   
  }); 
})




  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.event === "toggleSidebar"){
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
          var activeTab = tabs[0];
          
          chrome.tabs.sendMessage(activeTab.id, {event: "toggleSidebar"});
        });
      }
  });

    setInterval(()=>{      
      chrome.storage.sync.get(['soundChecked',"notificationChecked","startTime","timerRuned","timeLength"], (result)=> {       
        if(result.notificationChecked&&result.timerRuned&&(((result.timeLength*60)-((Date.now()-result.startTime)/1000))<=0)){
          chrome.notifications.create('reminder', {
            type: 'basic', 
            iconUrl:"../happy-timer-icon.svg",                
            title: 'Your time has run out',
            message: 'Great work!\n Your focus session is over.'
          });
        }

        
        if(result.soundChecked&&result.timerRuned&&(((result.timeLength*60)-((Date.now()-result.startTime)/1000))<=0)){
          
          chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            let url=tabs[0].url.split('://')
            var activeTab = tabs[0];      
            if(url[0]==="http"||url[0]==="https"){
              chrome.storage.sync.set({startTime:0,timerRuned:false,timeLength:0}, ()=> {
                chrome.tabs.sendMessage(activeTab.id, {event: "alert"});
              });   
            }  
          });
      
          
        }
        else if(result.timerRuned&&(((result.timeLength*60)-((Date.now()-result.startTime)/1000))<=0)){           
          chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            let url=tabs[0].url.split('://')
            var activeTab = tabs[0];      
            if(url[0]==="http"||url[0]==="https"){
              chrome.storage.sync.set({startTime:0,timerRuned:false,timeLength:0}, ()=> {
                chrome.tabs.sendMessage(activeTab.id, {event: "finishTimer"});     
                        
            
              });   
            }  
          });
        }
        
           
      });
      
    },1000)
   
    
    
    /*chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.event === "toggleSidebar"){
          chrome.tabs.query({}, function (tabs){
            for (var i=0; i<tabs.length; i++) {
              chrome.tabs.sendMessage(tabs[i].id, {event: "toggleSidebar"});
          }
            
           });
        }
      });*/