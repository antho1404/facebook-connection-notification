var getConnectionObj = function(callback, obj) {
  if(obj) return callback(obj);
  chrome.storage.sync.get('connections', function(data) {
    if(!data) data = {};
    if(!data['connections']) data['connections'] = {};
    callback(data['connections']);
  });
};

var setConnectionObj = function(obj) {
  chrome.storage.sync.set({'connections': obj});
};




Date.prototype.timeAgo = function() {
  var now   = new Date();
  var end   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var begin = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  var day_number = parseInt((end - begin) / (1000 * 60 * 60 * 24), 10);
  if(day_number === 0) {
    return "Today";
  } else {
    if(day_number === 1) return "Yesturday";
    if(day_number > 1) return day_number + " days ago";
  }
};

Date.prototype.minutesFromBeginOfDay = function() {
  return this.getHours() * 60 + this.getMinutes();
};

var initializeSvg = function(options) {
  var svg = document.querySelector("svg");
  svg.setAttribute("width", options.width + 2 * options.marges);
  svg.setAttribute("height", options.height + 2 * options.marges);

  var texts = svg.querySelectorAll("text");
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

  var axistag = svg.querySelector("path#axis");
  var separtaor_x = svg.querySelectorAll("text.x").length;
  var separtaor_y = svg.querySelectorAll("text.y").length;
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
  return svg;
};

var connectionsForMinute = function(connections, minuteOfDay) {
  var count = 0;
  var selected_dates = [];
  for(var i=0; i<connections.length; i++) {
    var connection = connections[i];
    var start_date = new Date(connection["start"]);
    var start = start_date.minutesFromBeginOfDay();
    var end   = null;
    if(connection["end"]) end = (new Date(connection["end"])).minutesFromBeginOfDay();
    else end = start_date.timeAgo() === "Today" ? (new Date()).minutesFromBeginOfDay() : 24 * 60 - 1;

    if(minuteOfDay >= start && minuteOfDay < end) count++;
  }
  return count;
};

var averageConnectionPerMinutes = function(id, callback) {
  getConnectionObj(function(obj) {
    var connections = obj[id]['connections'] || [];
    var data = [];
    for(var i=0; i<(60*24); i++) {
      data.push(connectionsForMinute(connections, i));
    }
    callback(data);
  });
};

var i_to_s = function(number){
  return (number < 10) ? "0" + number : number.toString();
};


var select = document.querySelector("#users");
getConnectionObj(function(data) {
  var getValue = function(callback) {
    var value = select.value;
    for(var key in data) {
      if(data[key]['name'] === value) {
        callback(key);
        return;
      }
    }
  };

  var refresh = function() {
    // var value = select.value;
    getValue(function(value) {
      if(value === "") {
        document.querySelector("#content").style.display = "none";
      } else {
        var ul = document.querySelector("#content ul");
        ul.innerHTML = "";
        var connections = data[value]['connections'] || [];
        for(var i=connections.length - 1; i>=0; i--) {
          var li = document.createElement("li");
          li.setAttribute("class", "connection");
          var date = new Date(connections[i]['start']);
          var timespend = "";
          if(connections[i]['end']) {
            var minutes_spend = ((connections[i]['end'] - connections[i]['start']) / 1000 / 60).toFixed(2);
            timespend = " <span>(" + minutes_spend + "min)<span>";
          }

          li.innerHTML = "<time title='" + date + "'>" + date.timeAgo() + " " + i_to_s(date.getHours()) + ":" + i_to_s(date.getMinutes()) + ":" + i_to_s(date.getSeconds()) + timespend + "</time>";
          ul.appendChild(li);
        }
        document.querySelector("#content .graph").style.display = "none";
        document.querySelector("#content .connections").style.display = "block";
        document.querySelector("#content a.graph_lnk").style.display = "inline";
        document.querySelector("#content a.data_lnk").style.display = "none";
        document.querySelector("#content").style.display = "block";
      }
    });
    return false;
  };

  select.addEventListener("keyup", function(ev) {
    if(ev.keyCode === 39 || ev.keyCode === 40) { // right or down
      document.querySelector("#users").value = document.querySelector("#autocomplete").value;
      return false;
    }
    if(ev.keyCode === 13) {
      return refresh();
    }
    for(var key in data) {
      if(data[key]['name'].toLowerCase().indexOf(select.value.toLowerCase()) === 0) {
        document.querySelector("#autocomplete").value = data[key]['name'];
        document.querySelector("#users").value = data[key]['name'].substr(0, select.value.length);
      }
    }
  });

  var clear = document.querySelector("#content a.clear_lnk");
  clear.addEventListener("click", function(ev) {
    // var value = select.value;
    getValue(function(value) {
      if(value !== "") {
        data[value]['connections'] = [];
        setConnectionObj(data);
        refresh();
      }
    });
    return false;
  });

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

        var svg = initializeSvg(options);

        var pathtag = svg.querySelector("path#data");
        pathtag.setAttribute("d", path.join(" "));

        document.querySelector("#content .graph").style.display = "block";
        document.querySelector("#content .connections").style.display = "none";
        document.querySelector("#content a.graph_lnk").style.display = "none";
        document.querySelector("#content a.data_lnk").style.display = "inline";
      });
    });
  });

  var datalnk = document.querySelector("#content a.data_lnk");
  datalnk.addEventListener("click", function(ev) {
    refresh();
  });
});
