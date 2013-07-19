// globals
var currentDepth = 0;
var buttonText = "Render Depth ";

$(window).load(function() {
	updateRenderButton();
})

function updateRenderButton() {
	$('#render').text(buttonText + (currentDepth+1).toString());
	if (template == null || template.attrs.points.length < 2) $('#render').attr('disabled', 'disabled');
	else $('#render').removeAttr('disabled');
}

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
}

function renderNextDepth() {
	// disable button for overeager users
	$('#render').attr('disabled', 'disabled');
	
	
	// update depth & button
	currentDepth++;
	updateRenderButton();
}

$('#render').click(function() {
	disableTemplating();
	renderNextDepth();
});

$('#clear-render').click(function() {
	currentDepth = 0;
	updateRenderButton();
	enableTemplating();
});