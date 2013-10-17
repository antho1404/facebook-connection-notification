var initializeSvg = function(options) {
  var chart = document.querySelector(".graph");

  chart.setAttribute("width", options.width + 2 * options.marges);
  chart.setAttribute("height", options.height + 2 * options.marges);

  var texts = chart.querySelectorAll("text");
  for(var i=0; i<texts.length; i++) {
    var text = texts[i];
    var text_value = "";
    for(var j=0; j<text.classList.length; j++) {
      var class_val = text.classList[j];
      var attr = class_val[0];
      var split = class_val.slice(1).split("-");
      if(split.length === 2) {
        var a = parseInt(split[0], 10);
        var b = parseInt(split[1], 10);
        var value = null;
        if(attr === "x")
          value = a * options.width / b + options.marges;
        else
          value = a * options.height / b + options.marges;

        if(text.classList.contains("y") && attr === "x") value -= options.textshift;
        if(text.classList.contains("x") && attr === "y") value += options.textshift;

        if(attr === "x") value -= 5;

        
        text.setAttribute(attr, value);
        if(j === 0) {
          var coeff = (attr === "x") ? parseInt(split[0], 10) : (parseInt(split[1], 10) - parseInt(split[0], 10));
          text.textContent = coeff * options['max'][attr] / parseInt(split[1], 10);
        }
      }
    }
  }

  var axistag = chart.querySelector("path#axis");
  var separtaor_x = chart.querySelectorAll("text.x").length;
  var separtaor_y = chart.querySelectorAll("text.y").length;
  var axis = [];
  axis.push("M" + options.marges + " " + options.marges);
  for(var sy=0; sy<separtaor_y; sy++) {
    axis.push("L" + options.marges + " " + (sy * (options.height / (separtaor_y - 1)) + options.marges));
    axis.push("L" + (options.marges - options.separatorSize) + " " + (sy * (options.height / (separtaor_y - 1)) + options.marges));
    axis.push("L" + options.marges + " " + (sy * (options.height / (separtaor_y - 1)) + options.marges));
  }
  for(var sx=0; sx<separtaor_x; sx++) {
    axis.push("L" + (options.marges + sx * options.width / (separtaor_x - 1)) + " " + (options.height + options.marges));
    axis.push("L" + (options.marges + sx * options.width / (separtaor_x - 1)) + " " + (options.height + options.marges + options.separatorSize));
    axis.push("L" + (options.marges + sx * options.width / (separtaor_x - 1)) + " " + (options.height + options.marges));
  }
  axistag.setAttribute("d", axis.join(" "));
  return chart;
};


var graph = document.querySelector("#content a.graph_lnk");
graph.addEventListener("click", function(ev) {
  // var value = select.value;
  getValue(function(value) {
    averageConnectionPerMinutes(value, function(data) {
      var max = 0;
      for(var j=0; j<data.length; j++) if(data[j] > max) max = data[j];
      
      var options = {
        width: 204,
        height: 160,
        marges: 20,
        textshift: 14,
        separatorSize: 3,
        max: {
          x: 24,
          y: max
        }
      };
      var step = parseInt(data.length / options.width, 10);
      var path = ["M" + options.marges + " " + (options.height + options.marges)];
      var i = 0;
      var x = options.marges;
      while(i<data.length) {
        var end = i + step;
        var sum = 0;
        var number = 0;
        while(i<end && i<data.length) {
          sum += data[i];
          number++;
          i++;
        }
        var avg = sum / number;
        var avgNormalized = parseInt((options.height + options.marges) - avg * options.height / options.max.y, 10);
        path.push("L" + x + " " + avgNormalized);
        x++;
      }

      var chart = initializeSvg(options);

      var pathtag = chart.querySelector("path#data");
      pathtag.setAttribute("d", path.join(" "));

      document.querySelector("#content .graph").style.display = "block";
      document.querySelector("#content .connections").style.display = "none";
      document.querySelector("#content a.graph_lnk").style.display = "none";
      document.querySelector("#content a.data_lnk").style.display = "inline";
    });
  });
});
