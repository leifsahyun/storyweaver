canvas = new fabric.Canvas("fabric_canvas");
threads = new Array();
tools = new Array();
var selectedTool = null;
canvas.selection = false;

//scrolling vars
const scrollingCoef = 1.15;
const screenWidth = 1000;
var canvasWidth = screenWidth;
var scrolling = false;
var lastX;
var deltaX;

//tools
tools = new Array();
tools.push(addEventTool);
tools.push(addThreadTool);

//update this variable to the fabric variable that tracks selected items when you have internet access
var updateLaterFabricSelectedItem = null;


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
		updateLaterFabricSelectedItem = options.target;
		if(options.target.type==="thread"){
			document.getElementById("thread-title").value=options.target.title;
		} else if (options.target.type==="event"){
			document.getElementById("event-title").value=options.target.title;
			document.getElementById("event-details").value=options.target.details;
		}
		selectToolset(options.target.type+"-tools");
	}
	else{
		selectToolset("default-tools");
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
				
				for(let element of threads){
					if(!element.clipped)
					{
						/**
						//alert("triggered: width="+canvasWidth);
						element.path[element.path.length-1][1] = canvasWidth;
						element.width = canvasWidth;
						element.dirty = true;
						canvas.renderAll();*/
					}
				}
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


canvas.on({
	"selection:created": updateSelection,
	"selection:updated": updateSelection,
	"selection:cleared": updateSelection
});

canvas.on("mouse:down", function(options){
	if(selectedTool){
		selectedTool.onuse(options);
		clearTool();
	} else if(!options.target){
		scrollOn(options);
	}
});





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
	//alert("updating text");
	if(source.includes("title")){
		//alert("title");
		updateLaterFabricSelectedItem.title = document.getElementById(source).value;
		updateLaterFabricSelectedItem.dirty=true;
		canvas.renderAll();
	} else {
		//alert("details");
		updateLaterFabricSelectedItem.details = document.getElementById(source).value;
	}
}


var firstthread = new Thread();
firstthread.top = 100;
canvas.add(firstthread);
threads.push(firstthread);

//just a helpful inspection function
function showObject(obj){
	for(let key in obj){
		alert(key+":"+obj[key]);
	}
}
