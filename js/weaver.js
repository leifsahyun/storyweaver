canvas = new fabric.Canvas("fabric_canvas");
tools = new Array();
var selectedTool = null;
canvas.selection = false;

//set initial drawing params
canvas.isDrawingMode = false;
canvas.freeDrawingBrush = new fabric["PencilBrush"](canvas);
canvas.freeDrawingBrush.color = 'black';
canvas.freeDrawingBrush.width = 5;

//set up delete key listener for the canvas only
//deleting things from the canvas is inelegant in current design,
//both this method and the tools use seperate deletion functions for different objects
//it would be more elegant for at least all my objects to have a remove method where they delete themselves
var canvasWrapper = document.getElementById('canvas-div');
canvasWrapper.tabIndex = 1000;
canvasWrapper.addEventListener("keydown", function(e){
	if(46===e.keyCode){ //46 is the delete key
		var toDelete = canvas.getActiveObject();
		if(toDelete.type==="thread"){
			removeThreadTool.onselect();
			return;
		}
		if(toDelete.type==="event"||toDelete.type==="mergeEvent"){
			removeEventTool.onselect();
			return;
		}
		canvas.discardActiveObject();
		canvas.remove(toDelete);
		delete toDelete;
	}
}, false);

//scrolling vars
const scrollingCoef = 1.15;
const screenWidth = 1000;
var canvasWidth = screenWidth;
var scrolling = false;
var lastX;
var deltaX;

//tools
tools = new Array();
tools.push(saveFileTool);
tools.push(loadFileTool);
tools.push(addEventTool);
tools.push(addThreadTool);
tools.push(removeEventTool);
tools.push(removeThreadTool);
tools.push(clipThreadTool);
tools.push(mergeThreadTool);
tools.push(splitThreadTool);
tools.push(drawTool);
tools.push(textTool);


function selectToolset(selectedSet){
	var sets = document.getElementsByClassName("button-menu");
	for(let element of sets){
		//element.innerHTML=selectedSet;
		if(element.id===selectedSet)
			element.style.display = "block";
		else
			element.style.display = "none";
	}
	/**for(let element of tools){
		if(element.toolset===selectedSet)
			element.visible = true;
		else
			element.visible = false;
	}*/
}

function updateSelection(options){
	if(options.target){
		//updateLaterFabricSelectedItem = options.target;
		if(options.target.type==="thread"){
			document.getElementById("thread-title").value=options.target.title;
		} else if (options.target.type==="event" || options.target.type==="mergeEvent"){
			document.getElementById("event-title").value=options.target.title;
			document.getElementById("event-details").value=options.target.details;
		}
		selectToolset(options.target.type+"-tools");
		if(options.target.type==="mergeEvent")
			selectToolset("event-tools");
	}
	else{
		selectToolset("default-tools");
	}
	for(var title of canvas.getObjects("story-title")){
		title.exitEditing();
	}
}


function scrollOn(options){
	lastX = options.pointer.x;
	deltaX = 0;
	scrolling = true;
	canvas.on("mouse:move", function(options){
		if(scrolling){
			deltaX = scrollingCoef*deltaX+options.pointer.x-lastX;
			lastX = options.pointer.x;
			var scroller = document.getElementById("canvas-div");
			scroller.scrollLeft = scroller.scrollLeft - deltaX;
			if(scroller.scrollLeft>canvasWidth-screenWidth){
				canvasWidth = canvasWidth+0.1*screenWidth;
				//document.getElementById("fabric-canvas").width=canvasWidth;
				/*
				for(let element of threads){
					if(!element.clipped)
					{
						/**
						//alert("triggered: width="+canvasWidth);
						element.path[element.path.length-1][1] = canvasWidth;
						element.width = canvasWidth;
						element.dirty = true;
						canvas.renderAll();
					}
				}*/
			}
		}
	});
	canvas.on("mouse:up", function(){
		scrolling = false;
		canvas.off("mouse:move");
		canvas.off("mouse:up");
		//alert(document.getElementById("canvas-div").scrollLeft);
	});
}

function setupCanvasEvents() {
	canvas.on({
		"selection:created": updateSelection,
		"selection:updated": updateSelection,
		"selection:cleared": updateSelection
	});

	canvas.on("mouse:down", function(options){
		if(selectedTool){
			if(selectedTool.onuse(options))
				clearTool();
		} else if(!options.target){
			//scrollOn(options);
		}
	});
} setupCanvasEvents();




function selectTool(toolId) {
	for(let element of tools){
		if(element.id===toolId){
			selectedTool = element;
			break;
		}
	}
	selectedTool.onselect();
	
}

function clearTool(){
	selectedTool = null;
}


function updateText(source){
	var selectedItem = canvas.getActiveObject();
	if(source.includes("title")){
		selectedItem.title = document.getElementById(source).value;
		selectedItem.dirty=true;
		canvas.renderAll();
	} else {
		//alert("details");
		selectedItem.details = document.getElementById(source).value;
	}
}


var firstthread = new Thread();
firstthread.top = 100;
canvas.add(firstthread);

var title = new StoryTitle("NewStory");
canvas.add(title);

//just a helpful inspection function
function showObject(obj){
	for(let key in obj){
		alert(key+":"+obj[key]);
	}
}
