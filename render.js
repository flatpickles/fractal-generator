// globals
var currentDepth = 0;
var buttonText = "Render Depth ";
var renderLine = null;
var renderSize = [800, 400];

// kinetic init
var renderStage = new Kinetic.Stage({
	container: 'rendered',
	width: renderSize[0],
	height: renderSize[1]
});
var renderLayer = new Kinetic.Layer();
renderStage.add(renderLayer);

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
		renderLine = new Kinetic.Line({
			points: [0, 0],
			stroke: 'purple',
			strokeWidth: 3,
			lineCap: 'round',
			lineJoin: 'round'
		});
		// update & add
		renderLine.attrs.points = template.attrs.points.slice(); // copy template
		renderLine.move((renderSize[0] - templateSize[0])/2, (renderSize[1] - templateSize[1])/2); // center
		renderLayer.add(renderLine);
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