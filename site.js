(function () {
  "use strict";

  var canvas = document.getElementById("heroScene");
  if (!canvas) {
    return;
  }

  var context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var width = 0;
  var height = 0;
  var ratio = 1;
  var points = [];
  var streams = [];
  var frameId = 0;

  var labels = ["input", "local", "wasm", "canvas", "file", "output"];
  var colors = ["#00c8c8", "#2f8a50", "#d66f24", "#f0b72f"];

  function resize() {
    ratio = Math.min(2, window.devicePixelRatio || 1);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || 560;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildScene();
    draw(0);
  }

  function buildScene() {
    var count = Math.max(8, Math.min(16, Math.round(width / 95)));
    points = [];
    streams = [];

    for (var index = 0; index < count; index += 1) {
      var column = index % 4;
      var row = Math.floor(index / 4);
      points.push({
        x: width * (0.42 + column * 0.16) + Math.sin(index * 1.7) * 26,
        y: height * (0.16 + row * 0.2) + Math.cos(index * 1.2) * 22,
        label: labels[index % labels.length],
        color: colors[index % colors.length]
      });
    }

    for (var stream = 0; stream < points.length * 2; stream += 1) {
      var start = stream % points.length;
      var end = (start + 1 + (stream % 3)) % points.length;
      streams.push({
        start: start,
        end: end,
        speed: 0.18 + (stream % 5) * 0.035,
        offset: (stream * 0.17) % 1
      });
    }
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#101615";
    context.fillRect(0, 0, width, height);

    drawGrid();
    drawStreams(time / 1000);
    drawPanels(time / 1000);

    if (!prefersReducedMotion.matches) {
      frameId = window.requestAnimationFrame(draw);
    }
  }

  function drawGrid() {
    var step = 40;
    context.save();
    context.strokeStyle = "rgba(247,255,252,0.06)";
    context.lineWidth = 1;
    for (var x = 0; x < width; x += step) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (var y = 0; y < height; y += step) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();
  }

  function drawStreams(seconds) {
    context.save();
    streams.forEach(function (stream) {
      var a = points[stream.start];
      var b = points[stream.end];
      var progress = (stream.offset + seconds * stream.speed) % 1;
      var x = a.x + (b.x - a.x) * progress;
      var y = a.y + (b.y - a.y) * progress;

      context.strokeStyle = "rgba(247,255,252,0.11)";
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();

      context.fillStyle = a.color;
      context.beginPath();
      context.rect(x - 3, y - 3, 6, 6);
      context.fill();
    });
    context.restore();
  }

  function drawPanels(seconds) {
    context.save();
    points.forEach(function (point, index) {
      var pulse = prefersReducedMotion.matches ? 0 : Math.sin(seconds * 1.3 + index) * 0.5 + 0.5;
      var w = 86;
      var h = 34;
      var x = point.x - w / 2;
      var y = point.y - h / 2;

      context.fillStyle = "rgba(247,255,252,0.09)";
      context.strokeStyle = point.color;
      context.lineWidth = 1 + pulse * 0.7;
      roundRect(x, y, w, h, 7);
      context.fill();
      context.stroke();

      context.fillStyle = "rgba(247,255,252,0.88)";
      context.font = "700 12px Inter, system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(point.label, point.x, point.y);
    });
    context.restore();
  }

  function roundRect(x, y, widthValue, heightValue, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + widthValue - radius, y);
    context.quadraticCurveTo(x + widthValue, y, x + widthValue, y + radius);
    context.lineTo(x + widthValue, y + heightValue - radius);
    context.quadraticCurveTo(x + widthValue, y + heightValue, x + widthValue - radius, y + heightValue);
    context.lineTo(x + radius, y + heightValue);
    context.quadraticCurveTo(x, y + heightValue, x, y + heightValue - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  window.addEventListener("resize", resize);
  prefersReducedMotion.addEventListener("change", function () {
    window.cancelAnimationFrame(frameId);
    draw(0);
    if (!prefersReducedMotion.matches) {
      frameId = window.requestAnimationFrame(draw);
    }
  });

  resize();
  if (!prefersReducedMotion.matches) {
    frameId = window.requestAnimationFrame(draw);
  }
})();
