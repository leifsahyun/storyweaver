//editor tools

class Tool {
	constructor(){
		this.id = "";
		this.onselect = function(){};
		this.onuse = function(){};
	}
}

var drawTool = new Tool();
drawTool.id = "default:draw";
drawTool.onselect = function(){
	canvas.isDrawingMode = !canvas.isDrawingMode;
	var drawButton = document.getElementById("drawButton");
	if(canvas.isDrawingMode){
		drawButton.style.background = 'black';
		drawButton.style.color = 'white';
	} else {
		drawButton.style.background = '';
		drawButton.style.color = '';
	}
	clearTool();
}

var textTool = new Tool();
textTool.id = "default:text";
textTool.onuse = function(options){
	var newText = new fabric.Textbox("new note", {left: options.pointer.x, top: options.pointer.y});
	newText.fontSize = 16;
	/**
	//The following anti-scaling function is unnecessary
	newText.on('scaling', function(e){
		var w=newText.width*newText.scaleX,
			h=newText.height*newText.scaleY;
		newText.set({
			'height': h,
			'width': w,
			'scaleX': 1,
			'scaleY': 1
		});
	});
	*/
	canvas.add(newText);
	return true;
}


var saveFileTool = new Tool();
saveFileTool.id = "file:save";
saveFileTool.onselect = function(){
	save();
	clearTool();
};

var loadFileTool = new Tool();
loadFileTool.id = "file:load";
loadFileTool.onselect = function(){
	load();
	clearTool();
};

var addEventTool = new Tool();
addEventTool.id = "add:event";
addEventTool.onuse = function(options){
	var targetThread = findNearestThread(options.pointer.x, options.pointer.y);
	if(targetThread){
		var evt = new Event(options.pointer.x, targetThread.top+0.5*threadWidth);
		canvas.add(evt);
		targetThread.addEvent(evt);
		return true;
	} else {
		return false;
	}
};

var addThreadTool = new Tool();
addThreadTool.id = "add:thread";
addThreadTool.onuse = function(options){
	var newThread = new Thread();
	newThread.top = options.pointer.y - 0.5*threadWidth;
	canvas.add(newThread);
	return true;
};

var removeEventTool = new Tool();
removeEventTool.id = "event:remove";
removeEventTool.onselect = function(options){
	var selectedEvent = canvas.getActiveObject();
	canvas.discardActiveObject();
	var threads = canvas.getObjects("thread");
	for(var t of threads){
		t.removeEvent(selectedEvent);
	}
	canvas.remove(selectedEvent);
	delete selectedEvent;
	clearTool();
}

var removeThreadTool = new Tool();
removeThreadTool.id = "thread:remove";
removeThreadTool.onselect = function(options){
	var selectedThread = canvas.getActiveObject();
	canvas.discardActiveObject();
	for(var e of selectedThread.events){
		canvas.remove(e);
	}
	canvas.remove(selectedThread);
	delete selectedThread;
	clearTool();
}

var clipThreadTool = new Tool();
clipThreadTool.id = "thread:clip";
clipThreadTool.onselect = function(options){
	this.originThread = canvas.getActiveObject();
}
clipThreadTool.onuse = function(options){
	if(options.pointer.x<=this.originThread.left)
		return true;
	else
		this.originThread.clip(options.pointer.x);
	return true;
}

var mergeThreadTool = new Tool();
mergeThreadTool.id = "thread:merge";
mergeThreadTool.onselect = function(){
	this.originThread = canvas.getActiveObject();
}
mergeThreadTool.onuse = function(options){
	var targetThread = findNearestThread(options.pointer.x, options.pointer.y);
	if(!targetThread)
		return false;
	mergeEvent = new MergeEvent(options.pointer.x, targetThread.top+0.5*threadWidth);
	mergeEvent.setOriginThread(this.originThread);
	targetThread.addEvent(mergeEvent);
	canvas.add(mergeEvent);
	canvas.renderAll();
	return true;
}

var splitThreadTool = new Tool();
splitThreadTool.id = "thread:split";
splitThreadTool.onselect = function(){
	this.originThread = canvas.getActiveObject();
}
splitThreadTool.onuse = function(options){
	var newThread = new Thread();
	newThread.top = this.originThread.top+3*threadWidth;
	newThread.left = options.pointer.x;
	newThread.path.splice(0,1,["M",0,this.originThread.top-newThread.top],["L",20,0]);
	canvas.add(newThread);
	splitEvent = new MergeEvent(options.pointer.x, this.originThread.top+0.5*threadWidth);
	splitEvent.mergeType = "split";
	splitEvent.setOriginThread(newThread);
	this.originThread.addEvent(splitEvent);
	canvas.add(splitEvent);
	canvas.renderAll();
	return true;
}


var addLinkTool = new Tool();
addLinkTool.id = "event:link";
addLinkTool.onselect = function(){
	this.originEvent = canvas.getActiveObject();
}
addLinkTool.onuse = function(options){
	var targetEvent = options.target;
	if(!targetEvent)
		return false;
	if(targetEvent.type!="event" && targetEvent.type!="mergeEvent")
		return true;
	var newEventLink = new EventLink();
	canvas.add(newEventLink);
	newEventLink.setEvents([this.originEvent, targetEvent]);
	newEventLink.sendToBack();
	return true;
}

var removeLinkTool = new Tool();
removeLinkTool.id = "event:unlink";
removeLinkTool.onselect = function(){
	var selectedEvent = canvas.getActiveObject();
	var links = canvas.getObjects("eventLink");
	for (var eventLink of links){
		if(eventLink.events.includes(selectedEvent)){
			canvas.remove(eventLink);
			delete eventLink;
		}
	}
	clearTool();
}




const threadSelectRadius = 40;
function findNearestThread(x,y){
	let threads = canvas.getObjects("thread");
	let targetThread = threads[0];
	let minDistance = -1;
	for (let element of threads) {
		if(element.clipped && element.clipPos<x)
			continue;
		let dist = Math.abs(element.top+0.5*threadWidth - y);
		if(dist<minDistance || minDistance==-1) {
			minDistance = dist;
			targetThread = element;
		}
	}
	if(minDistance < threadSelectRadius)
		return targetThread;
	else
		return null;
}


