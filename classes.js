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

var Event = fabric.util.createClass(LabeledButton, {
	
	type: "event",
	
	initialize: function(x,y){
		this.callSuper("initialize", {radius: evtRadius});
		this.top = y-evtRadius;
		this.left = x-evtRadius;
		
		this.setIcon("js/res/Red_X.png");
		/**this.on("mousedown", function(){
			if(selectedTool===""){
				
			}
			if(!selectedTool.includes("event"))
				return;
			if(selectedTool==="event:remove")
				canvas.remove(this);
				//also need to remove this from all threads
			else
				return;
			selectedTool = "";
		});*/

	},
	
	fill: "#ddd",
	lockMovementX: false,
	title: "NEW EVENT",
	details: "Enter details here"
	
});

var Thread = fabric.util.createClass(fabric.Path, {

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
			if(!selectedTool.includes("thread"))
				return;
			if(selectedTool==="thread:remove"){
				canvas.remove(this);
			}
			else if(selectedTool==="thread:clip"){
				//clip threads here
			}
			else
				return;
			selectedTool = "";
		});
	},
	
	addEvent: function(evt){
		this.events.push(evt);
	},
	
	clip: function(){
		this.clipped = true;
	},
	
	objectCaching: false,
	hasControls: false,
	lockMovementX: true,
	strokeWidth: threadWidth,
	title: "NEW THREAD",
	titleFill: '#000',
	titleFont: '20px Helvetica',
	titleOffset: 0,
	clipped: false,
	
	_render: function(ctx) {
    	this.callSuper('_render', ctx);

    	ctx.font = this.titleFont;
    	ctx.fillStyle = this.titleFill;
		ctx.fillText(this.title, -this.width/2, -this.strokeWidth-this.titleOffset);
    	
		if(this.iconLoaded){
			ctx.drawImage(this.buttonIcon, this.imageOffset-this.width/2, this.imageOffset-this.height/2, this.width-2*this.imageOffset, this.height-2*this.imageOffset);
		}
  	}

});






/**

function ToolButton(options){
	var button = new LabeledButton({radius: buttonRadius, fill: 'skyblue'});
	button.set(options);
	return button;
}
*/
