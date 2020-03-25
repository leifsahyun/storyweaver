//editor tools

class Tool {
	constructor(){
		this.id = "";
		this.onselect = function(){};
		this.onuse = function(){};
	}
}

var saveFileTool = new Tool();
saveFileTool.id = "file:save";
saveFileTool.onselect = function(){
	var title = canvas.getObjects("story-title")[0].text;
	var jsonRep = canvas.toJSON();
	var stringified = JSON.stringify(jsonRep);
	var a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(stringified));
	a.setAttribute('download', title+'.json');
	a.click()
	clearTool();
};

var loadFileTool = new Tool();
loadFileTool.id = "file:load";
loadFileTool.onselect = function(){
	var input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.addEventListener("change", function(){
		var file = input.files[0];
		file.text().then(function(fileText){
			canvas.dispose();
			canvas = new fabric.Canvas("fabric_canvas");
			canvas.loadFromJSON(fileText, function(){
				var threads = canvas.getObjects("thread");
				for (var t of threads){
					for (var e of t.events){
						canvas.add(e);
					}
				}
			});
			canvas.renderAll();
			setupCanvasEvents();
			canvas.selection = false;
		});
	});
	input.click();
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
mergeThreadTool.onselect = function(options){
	this.originThread = canvas.getActiveObject();
}
mergeThreadTool.onuse = function(options){
	var targetThread = findNearestThread(options.pointer.x, options.pointer.y);
	this.originThread.clip(options.pointer.x);
	this.originThread.path.push(["L",this.originThread.clipPos+20,targetThread.top-this.originThread.top]);
	canvas.renderAll();
	return true;
}

var splitThreadTool = new Tool();
splitThreadTool.id = "thread:split";
splitThreadTool.onselect = function(options){
	this.originThread = canvas.getActiveObject();
}
splitThreadTool.onuse = function(options){
	var newThread = new Thread();
	newThread.top = this.originThread.top+3*threadWidth;
	newThread.left = options.pointer.x;
	newThread.path.splice(0,1,["M",0,this.originThread.top-newThread.top],["L",20,0]);
	canvas.add(newThread);
	canvas.renderAll();
	return true;
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


