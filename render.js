// globals
var currentDepth = 0;
var buttonText = "Render Iteration ";
var maxText = 'Max Iteration: ';
var renderLine = null;
var lineSize = 2;
var blockNext = false;
var maxPoints = 20000;

// kinetic init
var renderStage = new Kinetic.Stage({
	container: 'rendered',
	width: $('#rendered').width(),
	height: $('#rendered').height(),
	draggable: false
});
var renderLayer = new Kinetic.Layer({
	draggable: true
});
renderStage.add(renderLayer);

// handle zooming to a point
// adapted from http://stackoverflow.com/questions/12372475/scaling-to-a-fixed-point-in-kineticjs
var zoomUI = {
	stage: renderStage,
	line: renderLine,
	zoomSpeed: 1/300,
	scale: 1,
	zoomFactor: 1.1,
	origin: {
		x: 0,
		y: 0
	},
	zoom: function(e) {
		e.preventDefault();
		// move stage to zoom to cursor location
		var evt = e.originalEvent,
			mx = evt.offsetX,
			my = evt.offsetY,
			wheel = evt.wheelDelta * zoomUI.zoomSpeed;
		var zoom = (zoomUI.zoomFactor - (evt.wheelDelta < 0 ? 0.2 : 0)); // zoom out more slowly
		var newScale = zoomUI.scale * zoom;
		zoomUI.origin.x = mx / zoomUI.scale + zoomUI.origin.x - mx / newScale;
		zoomUI.origin.y = my / zoomUI.scale + zoomUI.origin.y - my / newScale;
		zoomUI.stage.setOffset(zoomUI.origin.x, zoomUI.origin.y);
		zoomUI.stage.setScale(newScale);
		zoomUI.scale *= zoom;
		// resize line appropriately
		if (renderLine != null) renderLine.setStrokeWidth(lineSize / zoomUI.scale);
		// render
		zoomUI.stage.draw();
	},
	reset: function() {
		// reset UI vars
		zoomUI.scale = 1;
		zoomUI.origin = {
			x: 0,
			y: 0
		};
		// reset stage
		zoomUI.stage.setScale(1);
		zoomUI.stage.setOffset(0, 0);
	}
}
$(renderStage.content).on('mousewheel', zoomUI.zoom);

// add a background object so drag-to-pan is possible from any point
var bg = new Kinetic.Rect({
	x: -1000000,
	y: -1000000,
	width: 2000000,
	height: 2000000,
	fill: '#ffffff',
	opacity: 0
});
renderLayer.add(bg);

// reflect iterations, limit etc in button text
function updateRenderButton() {
	$('#render').text(buttonText + (currentDepth+1).toString());
	if (template == null || template.attrs.points.length < 2) $('#render').attr('disabled', 'disabled');
	else if (renderLine == null || renderLine.attrs.points.length < maxPoints) $('#render').removeAttr('disabled');
	else {
		$('#render').attr('disabled', 'disabled');
		$('#render').text(maxText + currentDepth.toString());
	}
};

// the brains AND the brawn
function renderNextDepth() {
	// create render if null
	if (renderLine == null) {
		// reset drag & zoom offsets of stage
		zoomUI.reset();
		renderLayer.setAbsolutePosition(0, 0);
		// create the line
		renderLine = new Kinetic.Line({
			points: [0, 0],
			stroke: lineColor,
			strokeWidth: lineSize,
			lineCap: 'round',
			lineJoin: 'round'
		});
		// update & add
		renderLine.attrs.points = template.attrs.points.slice(); // copy template
		renderLine.move(($('#rendered').width() - $('#template').width())/2, ($('#rendered').height() - $('#template').height())/2); // center
		renderLayer.add(renderLine);
	} 
	// otherwise, take the plunge
	else {
		// get info from template
		var tp1 = template.attrs.points[0];
		var tp2 = template.attrs.points[template.attrs.points.length-1];
		var tempDist = Math.sqrt(Math.pow(tp2.x - tp1.x, 2) + Math.pow(tp2.y - tp1.y, 2));
		var tempRotation = Math.atan2(tp2.y - tp1.y, tp2.x - tp1.x);
		// create a pre-rotated template array, normalized for scaling
		var rTemp = new Array();
		for (var t = 1; t < template.attrs.points.length - 1; t++) {
			var pt = {x:template.attrs.points[t].x - tp1.x, y:template.attrs.points[t].y - tp1.y};
			var newX = Math.cos(-tempRotation) * (pt.x) - Math.sin(-tempRotation) * (pt.y);
			var newY = Math.sin(-tempRotation) * (pt.x) + Math.cos(-tempRotation) * (pt.y);
			rTemp.push({x:newX, y:newY});
		}
		// create new points array
		var newPoints = new Array();
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
			for (var t = 0; t < rTemp.length; t++) {
				var newPoint = {x:rTemp[t].x, y:rTemp[t].y};
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
	blockNext = false;
};

// bind stuff
$(window).load(function() {
	updateRenderButton();
	
	// handle image export
	$('#export').click(function() {
		// create white background
		bg.attrs.opacity = 1;
		renderLayer.draw();
		// download
		Canvas2Image.saveAsPNG(renderLayer.getCanvas());
		// remove white background
		bg.attrs.opacity = 0;
		renderLayer.draw();
	});
	
	// handle render control
	$('#render').click(function() {
		// don't let overeager users click too much
		if (blockNext) return;
		else blockNext = true;
		// go go go
		disableTemplating();
		renderNextDepth();
	});
	
	// clear the render panel
	$('#clear-render').click(function() {
		// clear display
		renderLayer.removeChildren();
		renderLayer.add(bg); // add back bg for panning
		renderLine = null;
		renderLayer.draw();
		
		// reset depth & enable
		currentDepth = 0;
		updateRenderButton();
		enableTemplating();
	});
});