
var audio_url = "http://www.ibiblio.org/pub/multimedia/pc-sounds/connect.wav";


var storeStartConnection = function(id, obj, callback) {
  getConnectionObj(id, function(id, obj) {
    var connections = obj['connections'];
    connections.push({start: (new Date()).getTime()});
    obj['connections'] = connections;
    setConnectionObj(id, obj, callback);
  }, obj);
};

var storeEndConnection = function(id, callback) {
  getConnectionObj(id, function(id, obj) {
    var connections = obj['connections'];
    var last_connection = connections[connections.length - 1];
    if(!last_connection || last_connection['end']) {
      callback(id);
      return;
    }
    last_connection['end'] = (new Date()).getTime();
    obj['connections'] = connections;
    setConnectionObj(id, obj, callback);
  });
};

var clearMissingTime = function(connections) {
  for(var i=0; i<connections.length; i++) {
    if(!connections[i]['end']) {
      if(i === connections.length - 1)
        connections[i]['end'] = (new Date()).getTime();
      else {
        var begin = new Date(connections['start']);
        var end   = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate(), 23, 59, 59);
        connections[i]['end'] = end.getTime();
      }
    }
  }
};

var playSound = function(id) {
  if(Config.ids_for_song.indexOf(parseInt(id, 10)) !== -1) {
    var audio = new Audio(audio_url);
    audio.play();
  }
  storeStartConnection(id);
};

var attrModified = function(mutations) {
  for(var i=0; i<mutations.length; i++) {
    var mutation = mutations[i];
    var name     = mutation.attributeName;
    var newValue = mutation.target.getAttribute(name);
    if(name === "class") {
      var connected = newValue.indexOf("connected") !== -1;
      var split = mutation.target.querySelector("a").href.split("/");
      var id    = split[split.length - 1];
      if(newValue.indexOf("active") !== -1 && !connected) {
        playSound(id);
        mutation.target.classList.add("connected");
      }
      if(newValue.indexOf("active") === -1 && connected) {
        storeEndConnection(id);
        mutation.target.classList.remove("connected");
      }
    }
  }
};

var next = function(id, callback) {
  if(Config.ids.indexOf(id) + 1 < Config.ids.length) getConnectionObj(Config.ids[Config.ids.indexOf(id) + 1], callback);
};

var onInitialize = function(id, obj) {
  clearMissingTime(obj['connections']);
  var element = document.querySelectorAll("[href='/messages/" + id + "']")[0].parentNode;
  if(element) {
    var observer = new WebKitMutationObserver(attrModified);
    observer.observe(element, { attributes: true });

    obj['name'] = element.querySelector(".accessible_elem").innerText;
    if(element.classList.contains("active")) {
      storeStartConnection(id, obj, function(id) {
        next(id, onInitialize);
      });
      element.classList.add("connected");
      return;
    }
  }
  setConnectionObj(id, obj, function(id) {
    next(id, onInitialize);
  });
};

window.onload = function() {
  setTimeout(function() {
    getConnectionObj(Config.ids[0], onInitialize);
  }, 5000);
};

var onUnload = function(id, obj) {
  var element = document.querySelectorAll("[href='/messages/" + id + "']")[0].parentNode;
  if(element) storeEndConnection(id);
};

window.onbeforeunload = function() {
  for(var i=0; i<Config.ids.length; i++) {
    var id = Config.ids[i];
    onUnload(id);
  }
};