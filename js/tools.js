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
};

var addEventTool = new Tool();
addEventTool.id = "add:event";
addEventTool.onuse = function(options){
	let threads = canvas.getObjects("thread");
	let targetThread = threads[0];
	let minDistance = -1;
	for (let element of threads) {
		let dist = Math.abs(element.top+0.5*threadWidth - options.pointer.y);
		if(dist<minDistance || minDistance==-1) {
			minDistance = dist;
			targetThread = element;
		}
	}
	var evt = new Event(options.pointer.x, targetThread.top+0.5*threadWidth);
	canvas.add(evt);
	targetThread.addEvent(evt);
};



var addThreadTool = new Tool();
addThreadTool.id = "add:thread";
addThreadTool.onuse = function(options){
	var newThread = new Thread();
	newThread.top = options.pointer.y - 0.5*threadWidth;
	canvas.add(newThread);
};




