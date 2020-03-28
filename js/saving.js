function save() {
	var current_uid = 0;
	for(var obj of canvas.getObjects()){
		obj.uid = current_uid++;
	}
	var title = canvas.getObjects("storyTitle")[0].text;
	var jsonRep = canvas.toJSON();
	var stringified = JSON.stringify(jsonRep);
	var a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(stringified));
	a.setAttribute('download', title+'.json');
	a.click();
}

function load() {
	var input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.addEventListener("change", function(){
		var file = input.files[0];
		file.text().then(function(fileText){
			canvas.dispose();
			canvas = new fabric.Canvas("fabric_canvas");
			canvas.loadFromJSON(fileText, relink);
			canvas.renderAll();
			setupCanvasEvents();
			canvas.selection = false;
			canvas.preserveObjectStacking = true;
		});
	});
	input.click();
}

function relink(){
	var threads = canvas.getObjects("thread");
	var events = canvas.getObjects("event").concat(canvas.getObjects("mergeEvent"));
	for (var t of threads){
		var newEvents = new Array();
		for (var uid of t.events){
			for (var e of events){
				if(e.uid==uid){
					newEvents.push(e);
					break;
				}
			}
		}
		t.events = newEvents;
	}
	var mergeEvents = canvas.getObjects("mergeEvent");
	for (var merge of mergeEvents){
		for (var t of threads){
			if(t.uid == merge.originThread){
				merge.setOriginThread(t);
			}
		}
	}
	var eventLinks = canvas.getObjects("eventLink");
	for (var eventLink of eventLinks){
		var newEvents = new Array();
		for (var evt of events){
			for (var id of eventLink.events){
				if(evt.uid===id)
					newEvents.push(evt);
			}
		}
		eventLink.setEvents(newEvents);
		eventLink.sendToBack();
	}
}