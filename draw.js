// globals
var template = null;
var circles = new Array();

// kinetic init
var stage = new Kinetic.Stage({
	container: 'template',
	width: 800,
	height: 400
});
var layer = new Kinetic.Layer();
stage.add(layer);

$('#template').click(function(e) {
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
		layer.add(template);
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
	layer.add(c);
	circles.push(c);
	
	// render
	layer.draw();
});

// remove current template & restart
$('#clear').click(function() {
	layer.removeChildren();
	template = null;
	circles = new Array();
	layer.draw();
});

// remove last segment of the template
$('#undo').click(function() {
	if (template == null) {
		return;
	} else if (template.attrs.points.length == 1) {
		$('#clear').click();
	} else {
		// remove last circle and line point
		var c = circles.pop();
		c.remove();
		template.attrs.points.pop();
		layer.draw();
	}
});