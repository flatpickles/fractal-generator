// globals
var currentDepth = 0;
var buttonText = "Render Depth ";
var renderLine = null;
var renderSize = [800, 400];

// kinetic init
var renderStage = new Kinetic.Stage({
	container: 'rendered',
	width: renderSize[0],
	height: renderSize[1],
	draggable: true
});
var renderLayer = new Kinetic.Layer();
renderStage.add(renderLayer);

// set up zoom
function zoom(e) {
	if (renderLine == null) return;
	var z = e.wheelDeltaY * 0.001;
	renderLayer.setScale(renderLayer.getScale().x + z);
};

$(window).load(function() {
	updateRenderButton();
});

function updateRenderButton() {
	$('#render').text(buttonText + (currentDepth+1).toString());
	if (template == null || template.attrs.points.length < 2) $('#render').attr('disabled', 'disabled');
	else $('#render').removeAttr('disabled');
};

function disableTemplating() {
	// disable templating mechanics
	drawingEnabled = false;
	$('#clear').attr('disabled', 'disabled');
	$('#undo').attr('disabled', 'disabled');
	$('#clear-render').removeAttr('disabled');
	// change colors of render
	template.setStroke("#C0C0C0");
	for (var c = 0; c < templateCircles.length; c++) {
		templateCircles[c].setFill("#808080");
	}
	templateLayer.draw();
};

function enableTemplating() {
	// enable templating mechanics
	drawingEnabled = true;
	$('#clear').removeAttr('disabled');
	$('#undo').removeAttr('disabled');
	$('#clear-render').attr('disabled', 'disabled');
	// change colors of render
	template.setStroke("red");
	for (var c = 0; c < templateCircles.length; c++) {
		templateCircles[c].setFill("black");
	}
	templateLayer.draw();
};

function renderNextDepth() {
	// disable button for overeager users
	$('#render').attr('disabled', 'disabled');
	
	// create render if null
	if (renderLine == null) {
		// reset drag & zoom offsets of stage
		renderStage.setAbsolutePosition({x:0, y:0})
		renderStage.drawScene();
		// create the line
		renderLine = new Kinetic.Line({
			points: [0, 0],
			stroke: 'purple',
			strokeWidth: 2,
			lineCap: 'round',
			lineJoin: 'round'
		});
		// update & add
		renderLine.attrs.points = template.attrs.points.slice(); // copy template
		renderLine.move((renderSize[0] - templateSize[0])/2, (renderSize[1] - templateSize[1])/2); // center
		renderLayer.add(renderLine);
	} 
	// otherwise, take the plunge
	else {
		// get info from template
		var tp1 = template.attrs.points[0];
		var tp2 = template.attrs.points[template.attrs.points.length-1];
		var tempDist = Math.sqrt(Math.pow(tp2.x - tp1.x, 2) + Math.pow(tp2.y - tp1.y, 2));
		var tempRotation = Math.atan2(tp2.y - tp1.y, tp2.x - tp1.x);
		// create new points array
		var newPoints = new Array();
		var totalSegs = (renderLine.attrs.points.length - 1) * (template.attrs.points.length - 2);
		var curSegs = 0;
		for (var p = 0; p < renderLine.attrs.points.length - 1; p++) {
			// get info for segment
			var p1 = renderLine.attrs.points[p];
			var p2 = renderLine.attrs.points[p+1];
			var dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
			var rotation = Math.atan2(p2.y - p1.y, p2.x - p1.x);
			var scale = dist/tempDist;
			// add current point
			newPoints.push({x:p1.x, y:p1.y});
			// iterate through template, adding points accordingly
			for (var t = 1; t < template.attrs.points.length - 1; t++) {
				var newPoint = {x:template.attrs.points[t].x - tp1.x, y:template.attrs.points[t].y - tp1.y}; 
				// rotate around origin to normalize
				var newX = Math.cos(-tempRotation) * (newPoint.x) - Math.sin(-tempRotation) * (newPoint.y);
				var newY = Math.sin(-tempRotation) * (newPoint.x) + Math.cos(-tempRotation) * (newPoint.y);
				newPoint = {x:newX, y:newY};
				// scale
				newPoint.x *= scale;
				newPoint.y *= scale;
				// rotate around origin
				newX = Math.cos(rotation) * (newPoint.x) - Math.sin(rotation) * (newPoint.y);
				newY = Math.sin(rotation) * (newPoint.x) + Math.cos(rotation) * (newPoint.y);
				newPoint = {x:newX, y:newY}
				// translate by p1
				newPoint.x += p1.x;
				newPoint.y += p1.y;
				// add
				newPoints.push(newPoint);
				// fill progress bar
				curSegs++;
			}
		}
		// add back last point
		newPoints.push({x:renderLine.attrs.points[renderLine.attrs.points.length-1].x, y:renderLine.attrs.points[renderLine.attrs.points.length-1].y});
		// set new points
		renderLine.attrs.points = newPoints;
	}
	
	// render
	renderLayer.draw();
	// update depth & button
	currentDepth++;
	updateRenderButton();
};

$('#render').click(function() {
	disableTemplating();
	renderNextDepth();
});

$('#clear-render').click(function() {
	// clear display
	renderLayer.removeChildren();
	renderLine = null;
	renderLayer.draw();
	
	// reset depth & enable
	currentDepth = 0;
	updateRenderButton();
	enableTemplating();
});