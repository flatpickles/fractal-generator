// globals
var template = null;
var templateCircles = new Array();
var drawingEnabled = true;
var templateSize = [400, 200];

// kinetic init
var stage = new Kinetic.Stage({
	container: 'template',
	width: templateSize[0],
	height: templateSize[1]
});
var templateLayer = new Kinetic.Layer();
stage.add(templateLayer);

$('#template').click(function(e) {
	// disable if drawingEnabled == false
	if (!drawingEnabled) return;
	// parse event points
	var xPt = e.pageX-$('#template').offset().left;
	var yPt = e.pageY-$('#template').offset().top;

	// create line if first click - continue line if not
	if (template == null) { 
		template = new Kinetic.Line({
			points: [xPt, yPt],
			stroke: 'red',
			strokeWidth: 3,
			lineCap: 'round',
			lineJoin: 'round'
		});
		templateLayer.add(template);
	} else {
		template.attrs.points.push({x:xPt, y:yPt});
	}
	
	// add circle to visualize point
	var c = new Kinetic.Circle({
		x: xPt,
		y: yPt,
		radius: 5,
		fill: 'black',
		strokeWidth: 0
	});
	templateLayer.add(c);
	templateCircles.push(c);
	// render
	templateLayer.draw();
	// update button
	updateRenderButton();
});

// remove current template & restart
$('#clear').click(function() {
	templateLayer.removeChildren();
	template = null;
	templateCircles = new Array();
	templateLayer.draw();
	// update button
	updateRenderButton();
});

// remove last segment of the template
$('#undo').click(function() {
	if (template == null) {
		return;
	} else if (template.attrs.points.length == 1) {
		$('#clear').click();
	} else {
		// remove last circle and line point
		var c = templateCircles.pop();
		c.remove();
		template.attrs.points.pop();
		templateLayer.draw();
		// update
		updateRenderButton();
	}
});