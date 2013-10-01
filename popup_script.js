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
  getConnectionObj(id, function(id, obj) {
    var connections = optimizedConnections(obj['connections']);
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
// getConnectionObj(function(data) {
var getValue = function(callback) {
  var value = select.value;
  for(var i=0; i<Config.ids.length; i++) {
    getConnectionObj(Config.ids[i], function(id, obj) {
      if(obj['name'] === value) {
        callback(id);
      }
    });
  }
};

var refresh = function() {
  // var value = select.value;
  getValue(function(value) {
    getConnectionObj(value, function(id, data) {
      console.log(id, data);
      if(value === "") {
        document.querySelector("#content").style.display = "none";
      } else {
        var ul = document.querySelector("#content ul");
        ul.innerHTML = "";
        var connections = data['connections'];
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
  if(select.value === "") {
    document.querySelector("#autocomplete").value = "";
    return refresh();
  }
   
  for(var i=0; i<Config.ids.length; i++) {
    getConnectionObj(Config.ids[i], function(id, obj) {
      if(obj['name'].toLowerCase().indexOf(select.value.toLowerCase()) === 0) {
        document.querySelector("#autocomplete").value = obj['name'];
        document.querySelector("#users").value = obj['name'].substr(0, select.value.length);
      }
    });
  }
});

var clear = document.querySelector("#content a.clear_lnk");
clear.addEventListener("click", function(ev) {
  // var value = select.value;
  getValue(function(value) {
    if(value !== "") {
      getConnectionObj(value, function(id, obj) {
        obj['connections'] = [];
        setConnectionObj(id, obj);
        refresh();
      });
    }
  });
  return false;
});

var datalnk = document.querySelector("#content a.data_lnk");
datalnk.addEventListener("click", function(ev) {
  refresh();
});
