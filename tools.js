//editor tools

class Tool {
	constructor(){
		this.id = "";
		this.onselect = function(){};
		this.onuse = function(){};
	}
}

var addEventTool = new Tool();
addEventTool.id = "add:event";
addEventTool.onuse = function(options){
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
	threads.push(newThread);
};




