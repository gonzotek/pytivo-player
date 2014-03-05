var pyWebUI = {};

function animateScreenSaver() {
    //console.log("currentTime: "+ pyWebUI.player.currentTime);
    //console.log("currentTime/1000: "+  Math.floor( (pyWebUI.player.currentTime)  ));
    var ctMod = Math.floor((pyWebUI.player.currentTime))%5;
    if(ctMod==0 || typeof pyWebUI.ssRandX == "undefined"){
        pyWebUI.ssRandX = Math.random();
        pyWebUI.ssRandY = Math.random();
    }
    var ssContext = pyWebUI.ssCanvas.getContext("2d");
    //pyWebUI.ssCanvas.height = pyWebUI.ssCanvas.height;
    ssContext.fillStyle = 'black';
    ssContext.fillRect(0,0,pyWebUI.ssCanvas.width,pyWebUI.ssCanvas.height);
    ssContext.font = "30pt Lato,sans-serif";
    var textY = pyWebUI.ssRandY*(pyWebUI.ssCanvas.height-120);
    if(document.getElementById("elapsedheader").innerHTML!==""){
        var timeLine =  document.getElementById("elapsedheader").innerHTML + " - " + document.getElementById("durationheader").innerHTML;
        var artistTextContent = decodeURIComponent(document.getElementById("headerArtist").textContent); 
        var albumTextContent = decodeURIComponent(document.getElementById("headerAlbum").textContent);
        var titleTextContent = decodeURIComponent(document.getElementById("headerNP").textContent);
    } else {
        var timeLine = "Nothing playing :(";
        var artistTextContent = "";
        var albumTextContent = "";
        var titleTextContent =  "";
        pyWebUI.ssRandX = Math.random();
        pyWebUI.ssRandY = Math.random();
    }
    var timeLineLength = ssContext.measureText(timeLine);
    var widthOffset = Math.max(ssContext.measureText(artistTextContent).width,
    ssContext.measureText(albumTextContent).width,
    ssContext.measureText(titleTextContent).width,
    timeLineLength.width);
    
    //console.log("width-offset: " + widthOffset);
    var textX = pyWebUI.ssRandX*(pyWebUI.ssCanvas.width-widthOffset);
    //var textXX = textX;
    
    var textX = pyWebUI.ssRandX*(pyWebUI.ssCanvas.width-widthOffset);
    var fillGradient = ["#D1D0CE","#B6B6B4","#848482","#6D6968","#565051"];
    ssContext.fillStyle = fillGradient[ctMod];//'white';
    ssContext.fillText(titleTextContent, textX, textY);
    ssContext.fillText(artistTextContent, textX, textY+40);
    ssContext.fillText(albumTextContent, textX, textY+80);  
    ssContext.fillText(timeLine, textX, textY+120);
    ssContext.fillStyle = 'black';
    
}

function buildScreenSaver() {
    var ssContext = pyWebUI.ssCanvas.getContext("2d");
    pyWebUI.ssCanvas.style.display="block";
    pyWebUI.ssCanvas.style.opacity="1";
    
    ssContext.fillRect(0,0,pyWebUI.ssCanvas.width,pyWebUI.ssCanvas.height);
    pyWebUI.animateSS = window.setInterval(function(){animateScreenSaver();},1000);
    pyWebUI.ssShowing = true;
    animateScreenSaver();
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    //hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10 && hours>9) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    if(hours<1) {
        return minutes + ":" + seconds;
    }
    else{
        return hours + ":" + minutes + ":" + seconds;
    }
}

function setFocus(obj) {
    var $ml = document.getElementById("mainlist");
    var $items = $ml.getElementsByTagName("li");
    for(var i=0;i<$items.length;i++){
    $items[i].className = "";
        if(obj.href==$items[i].getElementsByTagName('a')[0].href)$items[i].className="focused";
    }
}
function updateElapsedTimer() {
    //document.getElementById("elapsed").innerHTML = msToTime(1000*pyWebUI.player.currentTime);    
    document.getElementById("elapsedheader").innerHTML = msToTime(1000*pyWebUI.player.currentTime);  
    var duration  = parseInt(document.getElementById("durationheader").getAttribute("data-duration"));
    //console.log(duration);
    var percentdone = 1000*pyWebUI.player.currentTime/duration*100.0;
    /*
    background: -o-linear-gradient(left,  #777777 15%,#03273f 15%); 
	background: -moz-linear-gradient(left,  #777777 15%,#03273f 15%); 
	background: -webkit-linear-gradient(left,  #777777 15%,#03273f 15%);
	*/
	
    //console.log(Math.floor(percentdone*100));
    cssString = "background: -o-linear-gradient(left,  #777777 " + percentdone + "%,#03273f " + percentdone + "%); " +
	"background: -moz-linear-gradient(left,  #777777 " + percentdone + "%,#03273f " + percentdone + "%); " +
	" background: -webkit-linear-gradient(left,  #777777 " + percentdone + "%,#03273f " + percentdone + "%);";
    document.getElementById("transport").style.cssText += cssString;
}

//link:link, title:itemTitle, duration:itemDuration,artist:itemArtist,album:itemAlbum

function playNext() {
    if(pyWebUI.queue.length>0){
            var item = pyWebUI.queue.shift();
            pyWebUI.player.src=item["link"];

            document.getElementById("headerNP").innerHTML = decodeURIComponent(item["title"]);
            document.getElementById("headerAlbum").innerHTML = decodeURIComponent(item["album"]);
            document.getElementById("dash").innerHTML = "-";            
            document.getElementById("headerArtist").innerHTML = decodeURIComponent(item["artist"]);
            document.getElementById("durationheader").innerHTML = msToTime(item["duration"]);
            document.getElementById("durationheader").setAttribute("data-duration",item["duration"] );
            document.getElementById("elapsedheader").innerHTML = "0:00";
            document.getElementById("transport").style.visibility="visible";
            pyWebUI.player.play();
            pyWebUI.history.push(item);
        } else {
            document.getElementById("headerNP").innerHTML = "";
            document.getElementById("headerAlbum").innerHTML = "";
            document.getElementById("dash").innerHTML = "";            
            document.getElementById("headerArtist").innerHTML = "";
            document.getElementById("durationheader").innerHTML = "";
            document.getElementById("durationheader").setAttribute("data-duration","" );
            document.getElementById("elapsedheader").innerHTML = "";
            document.getElementById("transport").style.visibility="hidden";
        }
        return false;
}

function playPrev() {
    if(pyWebUI.history.length>0){
            clearTimeout(pyWebUI.reversing);
            var item;
            if(pyWebUI.player.currentTime<5 && pyWebUI.history.length>1){
                item = pyWebUI.history.pop();
                pyWebUI.queue.unshift(item);
            }
            item = pyWebUI.history.pop();
            pyWebUI.queue.unshift(item);
            pyWebUI.reversing = setTimeout(function() {playNext();},250);

        } 
        return false;
}

function leftArrowPressed() {
   var $ml = document.getElementById("mainlist");
   var $items = $ml.getElementsByTagName("li");
   if($items[0].getElementsByTagName("a")[0].getAttribute("data-type")=="audio/mpeg"){
    var parent = $items[0].getElementsByTagName("a")[0].getAttribute("data-parent");
    //console.log("musicparent: " + parent);
    parent = parent.split("/");
    var firstParent = parent.pop();
    var lastParent = parent.pop();
    //console.log({parentnL:parent.join("/")});
    var newLoc = "TiVoConnect?Command=QueryContainer&Container=" + parent.join("/").substring(1);
    pyWebUI.currentLoc = "http://" + location.host + "/" + newLoc + "/" + lastParent + "/" + firstParent;
   } 
   else {
    for (var i = 0; i<$items.length;i++){
    if($items[i].className=="focused"){
    pyWebUI.currentLoc = $items[i].getElementsByTagName("a")[0].href;
    }
    }
//     pyWebUI
    //console.log("currentLoc:" +pyWebUI.currentLoc);
    var newLoc = "TiVoConnect?Command=QueryContainer";
    var oldContainer = pyWebUI.currentLoc.split("&Container=");
    if (oldContainer.length > 1){
        var newContainer = "";
        var parts = oldContainer[1].split("/");
//      if(parts.length !== 1){
//          console.log("parts:" +parts);
//          for (i=0;i<parts.length-1;i++){
//          if(parts[i]!=="")newContainer+=parts[i] 
//          if(i!==parts.length-2) newContainer+="/";
//          } 
//      }
	console.log(parts);
        parts.pop();
        console.log(parts);
        parts.pop();
        console.log(parts);
        newContainer = parts.join("/");
        //console.log("newcontainer: "+ newContainer);
        newLoc+="&Container="+newContainer;
     }
    }
        //console.log("newLoc " + newLoc);
        if(newLoc.split("Container=").length>1){
        	var container = newLoc.split("Container=")[1];
        	document.getElementById("loc").innerHTML = decodeURIComponent(container);
        }else{
        	document.getElementById("loc").innerHTML = "";
        }
        var xhr = new XMLHttpRequest();
        console.log(newLoc);
        xhr.open('GET',newLoc);
        //xhr.responseType = 'document';
        xhr.addEventListener('load', function(e) {
            buildList(e, newLoc);
        } );
    xhr.send();
    
}

function rightArrowPressed() {
    //e.preventDefault();
   // Your stuff here
   var $ml = document.getElementById("mainlist");
   var $items = $ml.getElementsByTagName("li");
   var toQueue = false;
   for (var i=0;i<$items.length;i++){
        var link = $items[i].getElementsByTagName("a")[0].href;
        var dataType = $items[i].getElementsByTagName("a")[0].getAttribute("data-type");
        var itemArtist = $items[i].getElementsByTagName("a")[0].getAttribute("data-artist");
        var itemAlbum = $items[i].getElementsByTagName("a")[0].getAttribute("data-albumTitle");
        var itemDuration = $items[i].getElementsByTagName("a")[0].getAttribute("data-duration");
        var itemTitle = $items[i].getElementsByTagName("a")[0].getAttribute("data-songTitle");  
        if ($items[i].className == "focused"){
            if(dataType!=="audio/mpeg"){
                var xhr = new XMLHttpRequest();
                var container = link.split("Container=")[1];
                 document.getElementById("loc").innerHTML = decodeURIComponent(container);
                xhr.open('GET',link);
                //xhr.responseType = 'document';
                xhr.addEventListener('load', function(e) {
                    //pyWebUI.currentLoc = link;
                    buildList(e, "player.htm?Command=QueryContainer&Container="+container);
                } );
                xhr.send();
            } else{ 
            pyWebUI.queue = [];
            toQueue = true;
            }
            
        }
        if(toQueue==true && dataType == "audio/mpeg"){
        pyWebUI.queue.push({link:link, title:itemTitle, duration:itemDuration,artist:itemArtist,album:itemAlbum});
        }
    }
    if(toQueue==true)playNext();
    return false;
}

function upArrowPressed() {
   // Your stuff here
   var $ml = document.getElementById("mainlist");
   var $items = $ml.getElementsByTagName("li");
   for (var i=0;i<$items.length;i++){
        if ($items[i].className == "focused" && i>0){
         $items[i].className = "";
         $items[i-1].className = "focused";
         $scrollPos = ($items[i-1].scrollHeight * i) - $items[i-1].scrollHeight
         $ml.scrollTop= $scrollPos;
         var dataType = $items[i-1].getElementsByTagName("a")[0].getAttribute("data-type");
         if(dataType=="audio/mpeg"){
            var infoPane = document.getElementById("info");
            infoPane.innerHTML = "<h1>Song Info</h1>";
            var infoArtistName = "<div>" + $items[i-1].getElementsByTagName("a")[0].getAttribute("data-artist") + "</div>";
            var infoAlbumName = "<div>" + $items[i-1].getElementsByTagName("a")[0].getAttribute("data-albumTitle") + "</div>";
            var infoSongName = "<div>" + $items[i-1].getElementsByTagName("a")[0].getAttribute("data-songTitle") + "</div>";
            infoPane.innerHTML+=infoArtistName+infoAlbumName + infoSongName;
         } else {
            var infoPane = document.getElementById("info");
            infoPane.innerHTML = "";
            }
         break;
         }
         if(i==0)$ml.scrollTop=0;
         
   }
}

function downArrowPressed() {
   // Your stuff here
   var $ml = document.getElementById("mainlist");
   var $items = $ml.getElementsByTagName("li");
   for (var i=0;i<$items.length;i++){
        if ($items[i].className == "focused" && i<$items.length-1){
         $items[i].className = "";
         $items[i+1].className = "focused";
         $scrollPos = $items[i+1].scrollHeight * i;
         $ml.scrollTop= $scrollPos;
         var dataType = $items[i+1].getElementsByTagName("a")[0].getAttribute("data-type");
         if(dataType=="audio/mpeg"){
            var infoPane = document.getElementById("info");
            infoPane.innerHTML = "<h1>Song Info</h1>";
            var infoArtistName = "<div>" + $items[i+1].getElementsByTagName("a")[0].getAttribute("data-artist") + "</div>";
            var infoAlbumName = "<div>" + $items[i+1].getElementsByTagName("a")[0].getAttribute("data-albumTitle") + "</div>";
            var infoSongName = "<div>" + $items[i+1].getElementsByTagName("a")[0].getAttribute("data-songTitle") + "</div>";
            infoPane.innerHTML+=infoArtistName+infoAlbumName + infoSongName;
         }else {
            var infoPane = document.getElementById("info");
            infoPane.innerHTML = "";
            }
         break;
         }
   }
   
}

function buildList(e, link) {
    var mL = document.getElementById("mainlist");
    mL.innerHTML="";
    //var contentType = e.target.responseXML.getElementsByTagName("ContentType")[0].childNodes[0].nodeValue;
    //console.log("contenttype: "+contentType);
    var items = e.target.responseXML.getElementsByTagName("Item");
    //console.log(items);
    for (var i = 0;i<items.length;i++){
    var item = {};
        item.details = items[i].getElementsByTagName("Details")[0];//
        item.links = items[i].childNodes[3];
        item.title = item.details.getElementsByTagName("Title")[0].childNodes[0].nodeValue;
        item.type = item.details.getElementsByTagName("ContentType")[0].childNodes[0].nodeValue;
        if(item.type=="audio/mpeg"){
        if(typeof item.details.getElementsByTagName("Duration")[0] !== "undefined") item.duration = item.details.getElementsByTagName("Duration")[0].childNodes[0].nodeValue;
        
        if (typeof item.details.getElementsByTagName("ArtistName")[0] !== "undefined"
        && typeof item.details.getElementsByTagName("ArtistName")[0].childNodes[0] !== "undefined") item.artist = item.details.getElementsByTagName("ArtistName")[0].childNodes[0].nodeValue;
        
        if (typeof item.details.getElementsByTagName("SongTitle")[0] !== "undefined"
        && typeof item.details.getElementsByTagName("SongTitle")[0].childNodes[0] !== "undefined") item.songTitle = item.details.getElementsByTagName("SongTitle")[0].childNodes[0].nodeValue;
        
        if (typeof item.details.getElementsByTagName("AlbumTitle")[0] !== "undefined"
        && typeof item.details.getElementsByTagName("AlbumTitle")[0].childNodes[0] !== "undefined") item.albumTitle = item.details.getElementsByTagName("AlbumTitle")[0].childNodes[0].nodeValue;
        
        if (typeof item.details.getElementsByTagName("AlbumYear")[0] !== "undefined"
        && typeof item.details.getElementsByTagName("AlbumYear")[0].childNodes[0] !== "undefined") item.albumYear = item.details.getElementsByTagName("AlbumYear")[0].childNodes[0].nodeValue;
        
        if (typeof item.details.getElementsByTagName("MusicGenre")[0] !== "undefined"
        && typeof item.details.getElementsByTagName("MusicGenre")[0].childNodes[0] !== "undefined") item.musicGenre = item.details.getElementsByTagName("MusicGenre")[0].childNodes[0].nodeValue;
        } else if(item.type=="x-container/tivo-videos" || item.type=="x-container/tivo-photos"){//ignore other share types for now
        continue;
        }
        var itemUrl = item.links.childNodes[1].getElementsByTagName("Url")[0].childNodes[0].nodeValue;
        var li = document.createElement("li");
        var href = itemUrl;
        if (i==0){
        li.className="focused";
        var parent = "http://" + location.host + href ;
        //console.log({parentPe: parent});
        parent = parent.split("/");
        parent.pop();
        parent = parent.join("/");
        //console.log({parentPost:parent});
        }
        
        var anchor = document.createElement("a");
        anchor.className = 'link';
        anchor.href = 'http://' + location.host + href ;
        anchor.setAttribute('data-type',item.type);
        anchor.setAttribute('data-duration',item.duration);
        anchor.setAttribute('data-songTitle',item.songTitle);
        anchor.setAttribute('data-albumTitle',item.albumTitle);
        anchor.setAttribute('data-artist',item.artist);
        anchor.setAttribute('data-albumYear',item.albumYear);
        anchor.setAttribute('data-MusicGenre',item.musicGenre);
        anchor.setAttribute('data-parent',itemUrl);
        anchor.innerHTML = item.title;
         li.appendChild(anchor)
         anchor.setAttribute('onclick','setFocus(this);rightArrowPressed();return false');
         if(item.type=="audio/mpeg")li.innerHTML += "<span class='itemTime'>"+msToTime(item.duration) +"</span>";
        mL.appendChild(li);
    }
    var matched = false;
    for (var i = 0;i<mL.getElementsByTagName("li").length;i++){
        mL.getElementsByTagName("li")[i].className="";
        var lastLoc = ""
        lastLoc = pyWebUI.currentLoc.split("/");
        lastLoc.pop();
        lastLoc = lastLoc.join("/");
        //console.log("lastLoc: "+lastLoc);
        //console.log(mL.getElementsByTagName("li")[i].getElementsByTagName("a")[0].href, lastLoc)
        if(mL.getElementsByTagName("li")[i].getElementsByTagName("a")[0].href==lastLoc || mL.getElementsByTagName("li")[i].getElementsByTagName("a")[0].href==pyWebUI.currentLoc){
        	matched = true;
            $scrollPos = mL.getElementsByTagName("li")[i].scrollHeight * i
            mL.scrollTop= $scrollPos;
            mL.getElementsByTagName("li")[i].className="focused"
        }
    }
    if(!matched){
        mL.getElementsByTagName("li")[0].className="focused";
        mL.scrollTop= 0;
    }
    //mL.setAttribute("data-parent",pyWebUI.currentLoc);
                if(mL.getElementsByTagName("li")[0].getElementsByTagName("a")[0].getAttribute('data-type')=="audio/mpeg"){
            	var infoPane = document.getElementById("info");
            	infoPane.innerHTML = "<h1>Song Info</h1>";
            	var infoArtistName = "<div>" + decodeURIComponent(mL.getElementsByTagName("li")[0].getElementsByTagName("a")[0].getAttribute("data-artist")) + "</div>";
            	var infoAlbumName = "<div>" + decodeURIComponent(mL.getElementsByTagName("li")[0].getElementsByTagName("a")[0].getAttribute("data-albumTitle")) + "</div>";
            	var infoSongName = "<div>" + decodeURIComponent(mL.getElementsByTagName("li")[0].getElementsByTagName("a")[0].getAttribute("data-songTitle")) + "</div>";
            	infoPane.innerHTML+=infoArtistName+infoAlbumName + infoSongName;
            } else {
            	document.getElementById("info").innerHTML="";
            }
            var history = link.split("?");
            console.log(history);
            if(history.length>1){
           	 history = "?"+history[1];
           	 if(history.split("/").length>1){
           	 history = history.split("/");
           	 //history.pop();
           	 history = history.join("/");
           	 }
           	 updateHistory({},"","player.htm" + history);
            }
}

function updateHistory(state,title,url){
	history.pushState(state, title, url);
}

function showSettings(){
//show settings
console.log("showing settings window");
}

function modeChange(){
            	switch(pyWebUI.mode)
            	{
            	case "nav":
            		console.log("switching to settings");
            		pyWebUI.mode = "settings";
            		showSettings();
            		break;
            	case "settings":
            		console.log("switching to nav");
            		pyWebUI.mode = "nav";
            		
            		break;
            	}
            	
}




document.onkeydown = function(evt) {
    evt = evt || window.event;
    window.clearTimeout(pyWebUI.ssTimer);
    pyWebUI.ssTimer = window.setTimeout(function() {buildScreenSaver();}, 30000);
    if(pyWebUI.ssShowing==true){
        pyWebUI.ssCanvas.style.opacity="0";
        //pyWebUI.ssCanvas.style.display="none";
        window.clearInterval(pyWebUI.animateSS);
        pyWebUI.ssShowing = false;
    }else{
        switch (evt.keyCode) {
        //TiVo remote to keycode mappings:
        /*
        Pause: 463
        Play: 415
        Rev: 412
        Fwd: 417
        Slow: 84
        Info: 457
        Guide: unavailable
        Live TV: unavailable
        Ch Up: 425
        Ch Dn: 424
        Rec: 86
        Th Dn: 437
        Th Up: 429
        skip back/zoom: 8
        skip fwd: unavailable?
        A: 405
        B: 406
        C: 403
        D: 404
        1: 49
        2: 50
        3: 51
        4: 52
        5: 53
        6: 54
        7: 55
        8: 56
        9: 57
        0: 48
        Enter/Select: 13
        
        */
            case 13: //Enter/Select
                rightArrowPressed();
                evt.preventDefault();
                break;
            case 37: //Left
                leftArrowPressed();
                evt.preventDefault();
                break;
            case 38: //Up
                upArrowPressed();
                evt.preventDefault();
                break;
            case 39: //Right
                rightArrowPressed();
                evt.preventDefault();
                break;
            case 40: //Down
                downArrowPressed();
                evt.preventDefault();
                break;
            case 73: //i key
            	modeChange();
            	evt.preventDefault();
            	break;
            case 424: //ch down
            for(var i=0;i<10;i++){downArrowPressed();}
                evt.preventDefault();
            	break;
            case 425: //ch up 
                for(var i=0;i<10;i++){upArrowPressed();}
                evt.preventDefault();
            	break;
            case 437: //thumb down
                playPrev();
                evt.preventDefault();
                break;
            case 429: //thumb up
                playNext();
                evt.preventDefault();
                break;
            case 457: //info
				modeChange();
            	evt.preventDefault();
            	break;
            case 32: //space bar
            case 463: //pause
                if(pyWebUI.player.paused){
                    pyWebUI.player.play();
                } else {
                    pyWebUI.player.pause();
                }
                evt.preventDefault();
                break;
            default:
                //document.getElementById("info").innerHTML = evt.keyCode;
                break;
        }
    }
};
window.onpopstate = function(e){
	console.log(location.href);
	var history = location.href.split("?Command=");
	if(history.length>1){
	    var xhr = new XMLHttpRequest();
    	var link = history[1];
    	console.log({link:"TiVoConnect?Command=" + link})
    	xhr.open('GET', "TiVoConnect?Command=" + link);
   		xhr.addEventListener('load', function(e) {
   		//document.getElementById("loc").innerHTML = link;
        buildList(e, link);
    } );
    xhr.send();
	
	}
	
	//e.PreventDefault();
}

window.onresize = function(){
    pyWebUI.ssCanvas.height=window.innerHeight;
    pyWebUI.ssCanvas.width=window.innerWidth;
    document.getElementById("mainlist").style.height =  window.innerHeight - document.getElementById("topBar").clientHeight - 30 + "px";
}
window.onload = function(evt) {
	//console.log(document.getElementById("topBar").clientHeight);
    document.getElementById("mainlist").style.height =  window.innerHeight - document.getElementById("topBar").clientHeight - 30 + "px";
    pyWebUI.currentLoc = 'TiVoConnect?Command=QueryContainer';
    if(location.search!==""){
    	pyWebUI.currentLoc = "TiVoConnect"+location.search;
    	container = location.search.split("Container=")[1];
    	//console.log("container: "+container);
    	if (container!==undefined)document.getElementById("loc").innerHTML = decodeURIComponent(container);
    	}
    //console.log(pyWebUI.currentLoc);
    pyWebUI.player = document.getElementById("audioplayer");
    pyWebUI.player.addEventListener('ended', playNext);
    pyWebUI.player.ontimeupdate = function() {updateElapsedTimer();};
    pyWebUI.queue = [];
    pyWebUI.history = [];
    var xhr = new XMLHttpRequest();
    var link = pyWebUI.currentLoc
    xhr.open('GET',link);
    xhr.addEventListener('load', function(e) {
    	pyWebUI.mode = "nav";
        pyWebUI.currentLoc = "";
        buildList(e, link);
    } );
    xhr.send();
    pyWebUI.ssCanvas = document.createElement("canvas");
    pyWebUI.ssCanvas.id="ssCanvas";
    pyWebUI.ssCanvas.height=window.innerHeight;
    pyWebUI.ssCanvas.width=window.innerWidth;
    pyWebUI.ssCanvas.style.position="fixed";
    pyWebUI.ssCanvas.style.top="0";
    pyWebUI.ssCanvas.style.left="0";
    //pyWebUI.ssCanvas.style.visibility="hidden";
    pyWebUI.ssCanvas.style.opacity="0";
    pyWebUI.ssCanvas.addEventListener('transitionend', function() {
        if(pyWebUI.ssCanvas.style.opacity=="0"){
            pyWebUI.ssCanvas.style.display="none";
        } else{
            pyWebUI.ssCanvas.style.visibility="block";
        }
    });
    pyWebUI.ssCanvas.onclick=function(){
		window.clearTimeout(pyWebUI.ssTimer);
		pyWebUI.ssTimer = window.setTimeout(function() {buildScreenSaver();}, 30000);
		if(pyWebUI.ssShowing==true){
        	pyWebUI.ssCanvas.style.opacity="0";
        	//pyWebUI.ssCanvas.style.display="none";
        	window.clearInterval(pyWebUI.animateSS);
        	pyWebUI.ssShowing = false;
   		}
    };
    document.getElementById("body").appendChild(pyWebUI.ssCanvas);
    pyWebUI.ssShowing = false;
    pyWebUI.ssTimer = window.setTimeout(function() {buildScreenSaver();}, 90000);
    document.getElementById("loc").onclick = function(){leftArrowPressed();};
}