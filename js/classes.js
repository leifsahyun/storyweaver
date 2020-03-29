const threadWidth = 20;
const evtRadius = 1*threadWidth;
const maxLineWidth = 150;
const lineHeight = 20;
//const buttonRadius = 50; obsolete from canvas buttons idea

const threadColors = [
"red", "green", "blue", "yellow", "purple", "pink", "magenta", "cyan"
];

var LabeledButton = fabric.util.createClass(fabric.Circle, {
	
	type: "labeledButton",
	
	initialize: function(options){
		this.callSuper("initialize", options);
		if(options && options.radius){
			this.radius = options.radius;
			this.width = 2*this.radius;
			this.height = 2*this.radius;
			this.imageOffset = this.radius*(1-Math.SQRT2/2);
		}
	},
	
	buttonIcon: null,
	iconLoaded: false,
	hasControls: false,
	lockMovementY: true,
	lockMovementX: true,
	objectCaching: false,
	title: "",
	titleOffset: 10,
	titleFill: '#000',
	titleFont: '20px Helvetica',
	
	setIcon: function(src){
		var that = this;
		this.buttonIcon = new Image();
		this.buttonIcon.src = src;
		this.buttonIcon.onload = function(){
			that.iconLoaded = true;
			that.dirty = true;
			canvas.renderAll();
		};
		this.buttonIcon.onerror = function(){
			that.iconLoaded = false;
			that.title = "error loading image";
			that.dirty = true;
			canvas.renderAll();
		};
	},
	
	_render: function(ctx) {
    	this.callSuper('_render', ctx);
		
		if(this.iconLoaded){
			ctx.drawImage(this.buttonIcon, this.imageOffset-this.width/2, this.imageOffset-this.height/2, this.width-2*this.imageOffset, this.height-2*this.imageOffset);
		}

		ctx.font = this.titleFont;
		ctx.fillStyle = this.titleFill;
		ctx.textAlign = "center";
		drawElementTitle(ctx, this.title, 0, -this.height/2-this.titleOffset);
		
  	}
	
});

fabric.Event = fabric.util.createClass(LabeledButton, {
	
	type: "event",
	
	initialize: function(x,y){
		this.callSuper("initialize", {radius: evtRadius});
		if(x && y){
			this.top = y-evtRadius;
			this.left = x-evtRadius;
		}
		this.setIcon("js/res/Red_X.png");
	},
	
	fill: "#ddd",
	lockMovementX: false,
	title: "NEW EVENT",
	details: "Enter details here",
	
	toObject: function(propOut) {
		if(!propOut)
			propOut = {};
		return fabric.util.object.extend(this.callSuper('toObject'), {
			...propOut,
			title: this.title,
			details: this.details,
			uid: this.uid
		});
	}
	
});
var Event = fabric.Event;

fabric.Event.fromObject = function(object, callback){
	var newEvent = new Event();
	newEvent.set({
		title: object.title,
		left: object.left,
		top: object.top,
		details: object.details,
		uid: object.uid
	});
	callback && callback(newEvent);
	return newEvent;
}



fabric.MergeEvent = fabric.util.createClass(fabric.Event, {
	type: "mergeEvent",
	mergeType: "merge", //can be split instead
	originThread: null,
	setOriginThread: function(thread){
		this.originThread = thread;
		this.recalculatePositions();
		this.originThread.on("moved", this.recalculatePositions.bind(this));
		this.on("moved", function(){this.recalculatePositions();this.originThread.trigger("moved");});
	},
	recalculatePositions: function(){
		if(!this.originThread)
			return;
		if(this.mergeType=="merge"){
			if(this.originThread.clipped)
				this.originThread.clip(this.originThread.clipPos);
			this.originThread.clip(this.left+evtRadius-20);
			this.originThread.path.push(["L",this.originThread.clipPos+20-this.originThread.left,this.top-this.originThread.top]);
		} else {
			this.originThread.left = this.left;
			this.originThread.path.splice(0,2,["M",0,this.top-this.originThread.top],["L",20,0]);
		}
		canvas.renderAll();
	},
	toObject: function(propOut) {
		if(!propOut)
			propOut = {};
		return fabric.util.object.extend(this.callSuper('toObject'), {
			...propOut,
			originThread: this.originThread.uid,
			mergeType: this.mergeType
		});
	}
});
var MergeEvent = fabric.MergeEvent;

fabric.MergeEvent.fromObject = function(object, callback){
	var newEvent = new MergeEvent();
	newEvent.set({
		originThread: object.originThread,
		mergeType: object.mergeType,
		title: object.title,
		left: object.left,
		top: object.top,
		details: object.details,
		uid: object.uid
	});
	callback && callback(newEvent);
	return newEvent;
}




fabric.Thread = fabric.util.createClass(fabric.Path, {

	type: "thread",
	
	initialize: function(){
		this.callSuper("initialize", "M 0 0 L 1000 0");
		this.events = new Array();
		
		this.stroke = threadColors[Math.floor(Math.random()*threadColors.length)];
		
		this.on("moved", function(){
			for (let element of this.events){
				element.set({top: this.top+0.5*threadWidth-evtRadius});
				element.setCoords();
				element.trigger("moved");
			}
		});
		this.on("mousedown", function(){
			if(!selectedTool || !selectedTool.includes("thread"))
				return;
			if(selectedTool==="thread:remove"){
				canvas.remove(this);
			}
			else
				return;
			selectedTool = "";
		});
	},
	
	addEvent: function(evt){
		this.events.push(evt);
	},
	
	removeEvent: function(evt){
		if(this.events.includes(evt)){
			this.events.splice(this.events.indexOf(evt),1);
			canvas.remove(evt);
		}
	},
	
	clip: function(pos){
		this.clipPos = pos;
		this.clipped = true;
		pos = pos-this.left;
		var newWidth = pos;
		var defaultStart = ["M", 0, 0];
		if(this.path[0].every((val,idx)=>val===defaultStart[idx]))
			this.path.splice(1);
		else
			this.path.splice(2);
		this.path.push(["L", pos, 0]);
		//when modifying a path, fabric does not update width of path
		this.set({
			'width': newWidth,
			'scaleX': 1
		});
		//...updating width of path does not update path offset and path is measured from center
		this.pathOffset.x = newWidth/2;
		//...updating width of path does not update bounding box (setCoords does)
		this.setCoords();
		//render changes
		canvas.renderAll();
		/**
		//old, overly complicated code for clipping path with splicing
		var found = false;
		for(var vec of this.path){
			if(vec[1]>=pos){
				vec[1] = pos;
				found = true;
				this.clipped = true;
				this.clipPos = pos;
				this.path.splice(this.path.indexOf(vec)+1);
				canvas.renderAll();
			}
		}
		if(found){
			for(e of this.events){
				if(e.left+evtRadius>pos){
					this.removeEvent(e);
				}
			}
		} else {
			this.path[this.path.length-1][1] = pos;
			canvas.renderAll();
		}
		*/
	},
	
	objectCaching: false,
	hasControls: false,
	lockMovementX: true,
	strokeWidth: threadWidth,
	fill: 'transparent',
	title: "NEW THREAD",
	titleFill: '#000',
	titleFont: '20px Helvetica',
	titleOffset: 0,
	clipped: false,
	clipPos: 0,
	
	_render: function(ctx) {
    	this.callSuper('_render', ctx);
		
		ctx.font = this.titleFont;
		ctx.fillStyle = this.titleFill;
		ctx.textAlign = "left";
		drawElementTitle(ctx, this.title, -this.width/2, -this.strokeWidth-this.titleOffset);
		
		/*if(this.iconLoaded){
			ctx.drawImage(this.buttonIcon, this.imageOffset-this.width/2, this.imageOffset-this.height/2, this.width-2*this.imageOffset, this.height-2*this.imageOffset);
		}*/
  	},
	
	toObject: function(propOut) {
		if(!propOut)
			propOut = {};
		var writableEvents = new Array();
		for (var evt of this.events){
			writableEvents.push(evt.uid);
		}
		return fabric.util.object.extend(this.callSuper('toObject'), {
			...propOut,
			title: this.title,
			events: writableEvents,
			clipped: this.clipped,
			clipPos: this.clipPos,
			uid: this.uid
		});
	}

});
var Thread = fabric.Thread;

fabric.Thread.fromObject = function(object, callback){
	var newThread = new Thread();
	newThread.set({
		title: object.title,
		stroke: object.stroke,
		top: object.top,
		left: object.left,
		path: object.path,
		clipped: object.clipped,
		clipPos: object.clipPos,
		events: object.events,
		uid: object.uid
	});
	callback && callback(newThread);
	return newThread;
}

fabric.StoryTitle = fabric.util.createClass(fabric.IText, {
	type: "storyTitle",
	selectable: false,
	top: 0,
	left: 0,
	initialize: function(title){
		this.callSuper("initialize", title);
		this.keysMap[13] = 'exitEditing';
	}
});
var StoryTitle = fabric.StoryTitle;
fabric.StoryTitle.fromObject = function(object, callback){
	var newTitle = new StoryTitle(object.text);
	callback && callback(newTitle);
	return newTitle;
}



fabric.EventLink = fabric.util.createClass(fabric.Line, {
	type: "eventLink",
	selectable: false,
	stroke: 'black',
	strokeDashArray: [3,2],
	events: [],
	setEvents: function(evts){
		this.events = evts;
		this.recalculatePositions();
		this.events[0].on("moved", this.recalculatePositions.bind(this));
		this.events[1].on("moved", this.recalculatePositions.bind(this));
	},
	recalculatePositions: function(){
		if(!this.events || this.events.length<2)
			return;
		this.set({
			x1: this.events[0].left+evtRadius,
			y1: this.events[0].top+evtRadius,
			x2: this.events[1].left+evtRadius,
			y2: this.events[1].top+evtRadius});
		canvas.renderAll();
	},
	toObject: function(propOut){
		var writableEvents = new Array();
		for (var evt of this.events){
			writableEvents.push(evt.uid);
		}
		return fabric.util.object.extend(this.callSuper('toObject'), {
			events: writableEvents
		});
	}
});
var EventLink = fabric.EventLink;
fabric.EventLink.fromObject = function(object, callback){
	var newLink = new EventLink();
	newLink.events = object.events;
	callback && callback(newLink);
	return newLink;
}



function drawElementTitle(ctx, title, baseX, baseY){
	var words = title.split(' ');
	var lines = [];
	var line = '';
	for(var word of words){
		var testLine = line + word + ' ';
		var testWidth = ctx.measureText(testLine).width;
		if(testWidth>maxLineWidth && line!=''){
			lines.push(line);
			line = word+' ';
		} else {
			line = testLine;
		}
	}
	lines.push(line);
	for(var n=0; n<lines.length; n++){
		ctx.fillText(lines[n], baseX, baseY-(lines.length-n-1)*lineHeight);
	}
}

/**

function ToolButton(options){
	var button = new LabeledButton({radius: buttonRadius, fill: 'skyblue'});
	button.set(options);
	return button;
}
*/
