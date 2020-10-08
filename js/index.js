var canvas, dataURL, context, dragging, x, y,
cPushArray = new Array(), activeLineWidth, cStep = -1;
const POINTS = {
	pencil: [],
	eraser: [],
	highlighter: false
}
const ACTIVE_BUTTON = {
	pencil: 'pencil',
	highlighter: 'highlighter',
	eraser: 'eraser'
};

const SHOW_PALETTE = {
	pencil: ['colors', 'brush-set'],
	highlighter: ['colors'],
	eraser: []
}

var activeTool = '', activeColor = '';

 function showExtraTools() {
	if (activeTool === ACTIVE_BUTTON.pencil) {
		document.getElementById('brush-set').style.display = 'block';
		document.getElementById('colors').style.display = 'block';
	} else if (activeTool === ACTIVE_BUTTON.highlighter) {
		document.getElementById('colors').style.display = 'block';
		document.getElementById('brush-set').style.display = 'none';
	} else {
		document.getElementById('brush-set').style.display = 'none';
		document.getElementById('colors').style.display = 'none';
	}
}

const redrawTool = (tool) => {
	POINTS[tool].forEach(({ moveTo, lineTo, strokeStyle, width }) => {
		context.beginPath();
		context.moveTo(moveTo.x, moveTo.y);
		context.globalAlpha = 1;
		context.lineCap = 'round';
		context.lineWidth = width;
		context.strokeStyle = strokeStyle;
		context.lineTo(lineTo.x , lineTo.y);
		context.stroke();
	})
}

const redraw = () => {
	if (activeTool === ACTIVE_BUTTON.highlighter && POINTS.highlighter) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		redrawTool(ACTIVE_BUTTON.pencil)
		redrawTool(ACTIVE_BUTTON.eraser);
		POINTS.highlighter = false;
		setHighlighterProperties();
		setEraserProperties();
	}
}

function setHighlighterProperties() {
	if (activeTool === ACTIVE_BUTTON.highlighter) {
		context.globalAlpha = 0.2;
		activeLineWidth = 5;
	} else {
		context.globalAlpha = 1;
	}
}

function setEraserProperties() {
	if (activeTool === ACTIVE_BUTTON.eraser) {
		context.globalCompositeOperation = "destination-out";
		activeLineWidth = 5;
		activeColor = 'rgb(255,255,255)';
	} else {
		context.globalCompositeOperation = "source-over";
		const swatch = document.getElementsByClassName('active')[0];
		activeColor = swatch.style.backgroundColor;
	}
}

function setLineWidth(activeLine) {
	const classMap = {
		'small': 1,
		'medium': 3,
		'large': 5
	}
	const ele = document.getElementById(activeLine);
	const active = document.getElementsByClassName('active-brush')[0];
	active && active.classList.remove('active-brush');
	ele.classList.add('active-brush');
	activeLineWidth = classMap[activeLine]
}

function lineClickEvent(line) {
	document.getElementById(line).addEventListener('click', e => setLineWidth(line) )
}

function toolClick(tool) {
	const toolButton = document.getElementById(tool);
	const clickHandler = (e) => {
		if (!tool) return;
		if (activeTool) {
			document.getElementById(activeTool).classList.remove('set')
		}
		activeTool = ACTIVE_BUTTON[tool];
		if (activeTool === ACTIVE_BUTTON.highlighter) {
			POINTS.highlighter = true;
		} 
		showExtraTools();
		setEraserProperties();
		setHighlighterProperties();
		e.currentTarget.classList.add('set');
	};
	toolButton.addEventListener('click', clickHandler);
}


function init() {
  var toolbarHeight, toolbar;
  canvas = document.getElementById('myCanvas');
  //canvas.width = 1000; //window.innerWidth;
  //canvas.height = 550; //window.innerHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  dataURL = canvas.toDataURL();
  context = canvas.getContext('2d');


  dragging = false;
	toolClick(ACTIVE_BUTTON.pencil)
	toolClick(ACTIVE_BUTTON.highlighter)
	toolClick(ACTIVE_BUTTON.eraser)
	lineClickEvent('small')
	lineClickEvent('medium')
	lineClickEvent('large')
	setLineWidth('medium')
	activeTool = ACTIVE_BUTTON.pencil;
	addSwatches();
	storeSnapshot();
}

function storeSnapshot() {
  cStep++;
  if (cStep < cPushArray.length) {
  	cPushArray.length = cStep;
  }
  cPushArray.push(canvas.toDataURL());
}

//Puts a circle down wherever the user clicks
var putPoint = (e) => {
  if (dragging) {
			context.beginPath();
			context.moveTo(x, y);
			context.lineCap = 'round';
			context.lineWidth = activeLineWidth;
			context.strokeStyle = activeColor;
			context.lineTo(e.pageX, e.pageY);
			context.stroke();
			if (activeTool !== ACTIVE_BUTTON.highlighter) 
				POINTS[activeTool].push({
					moveTo: {
						x,
						y
					},
					lineTo: {
						x: e.pageX,
						y: e.pageY
					},
					strokeStyle: activeColor,
					width: activeLineWidth
				});
			else
			POINTS.highlighter = true;
		x = e.pageX ;
		y = e.pageY ;
  }
}

var engage = (e) => {
	x = e.pageX ;
  y = e.pageY ;
  canvas.addEventListener('mousemove', putPoint);
	dragging = true;
	redraw();
  putPoint(e);
}

var disengage = () => {
  dragging = false;
  storeSnapshot();
}

function addSwatches() {
  var colors = [ '#ff0000', '#ff69b4', '#ffa500', '#008000', '#ffd700','#00ffd0', '#000', '#c5c5c5',];
  // var swatches = document.getElementsByClassName('swatch');
  for (var i = 0, n = colors.length; i < n; i++) {
		var swatch = document.createElement('div');
		swatch.className = 'swatch';
		swatch.style.backgroundColor = colors[i];
		swatch.addEventListener('click', setSwatch);
		document.getElementById('colors').appendChild(swatch);
  }
}

function setSwatch(e) {
  //identify swatch being clicked
  if (activeTool !== ACTIVE_BUTTON.eraser) {
		const swatch = e.target;
		setHighlighterProperties();
		const active = document.getElementsByClassName('active');
		active && active[0] && active[0].classList.remove('active')
		swatch.classList.add('active');
		activeColor = swatch.style.backgroundColor;
  }
}

/* Clear Canvas */
var clearButton = document.getElementById('clearCanvas');
clearButton.addEventListener('click', clearCanvas);

function clearCanvas(e) {
  storeSnapshot();
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function downloadCanvas(link, filename) {
	link.href = canvas.toDataURL();
  link.download = filename;
}

init();
canvas.addEventListener('mousedown', engage);
canvas.addEventListener('mouseup', disengage);
document.getElementById('save').addEventListener('click', function () {
  downloadCanvas(this, 'canvasDrawing.png');
}, false);

// sets first swatch as selected
setSwatch({
  target: document.getElementsByClassName('swatch')[0]
});
