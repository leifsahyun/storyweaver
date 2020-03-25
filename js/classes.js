const threadWidth = 20;
const evtRadius = 1*threadWidth;
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

    	ctx.font = this.titleFont;
    	ctx.fillStyle = this.titleFill;
		ctx.fillText(this.title, -this.width/2-50, -this.height/2-this.titleOffset);
    	
		if(this.iconLoaded){
			ctx.drawImage(this.buttonIcon, this.imageOffset-this.width/2, this.imageOffset-this.height/2, this.width-2*this.imageOffset, this.height-2*this.imageOffset);
		}
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
		return {};
	},
	
	toThreadProperty: function(propOpt) {
		return fabric.util.object.extend(this.callSuper('toObject'), {
			title: this.title,
			details: this.details
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
		details: object.details
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
		ctx.fillText(this.title, -this.width/2, -this.strokeWidth-this.titleOffset);
    	
		if(this.iconLoaded){
			ctx.drawImage(this.buttonIcon, this.imageOffset-this.width/2, this.imageOffset-this.height/2, this.width-2*this.imageOffset, this.height-2*this.imageOffset);
		}
  	},
	
	toObject: function(propOpt) {
		var writableEvents = new Array();
		for (var evt of this.events){
			writableEvents.push(evt.toThreadProperty());
		}
		return fabric.util.object.extend(this.callSuper('toObject'), {
			title: this.title,
			events: writableEvents,
			clipped: this.clipped,
			clipPos: this.clipPos
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
		path: object.path,
		clipped: object.clipped,
		clipPos: object.clipPos
	});
	if(object.events){
		fabric.util.enlivenObjects(object.events, function(enlivenedEvents){
			newThread.events = enlivenedEvents;
		});
	}
	callback && callback(newThread);
	return newThread;
}

fabric.StoryTitle = fabric.util.createClass(fabric.IText, {
	type: "story-title",
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


/**

function ToolButton(options){
	var button = new LabeledButton({radius: buttonRadius, fill: 'skyblue'});
	button.set(options);
	return button;
}
*/
