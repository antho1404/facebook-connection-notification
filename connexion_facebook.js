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




var ids = []; //ids of poeple you want to track 10394103431
var ids_for_song = []; //ids of poeple you wnat to be notified


var audio_url = "http://www.ibiblio.org/pub/multimedia/pc-sounds/connect.wav";

var storeStartConnection = function(id, obj) {
  getConnectionObj(function(obj) {
    var connections = obj[id]['connections'] || [];
    connections.push({start: (new Date()).getTime()});
    obj[id]['connections'] = connections;
    setConnectionObj(obj);
  }, obj);
};

var storeEndConnection = function(id, obj) {
  getConnectionObj(function(obj) {
    var connections = obj[id]['connections'] || [];
    var last_connection = connections[connections.length - 1];
    if(!last_connection || last_connection['end']) return;
    last_connection['end'] = (new Date()).getTime();
    obj[id]['connections'] = connections;
    setConnectionObj(obj);
  }, obj);
};

var clearMissingTime = function(obj) {
  for(var key in obj) {
    var connections = obj[key]['connections'] || [];
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
  }
};

var playSound = function(id) {
  if(ids_for_song.indexOf(parseInt(id, 10)) !== -1) {
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

window.onload = function() {
  setTimeout(function() {
    getConnectionObj(function(obj) {
      clearMissingTime(obj);
      for(var i=0; i<ids.length; i++) {
        var id = ids[i];
        var element = document.querySelectorAll("[href='/messages/" + id + "']")[0].parentNode;
        if(element) {
          var observer = new WebKitMutationObserver(attrModified);
          observer.observe(element, { attributes: true });

          if(!obj[id]) { obj[id] = {}; }
          obj[id]['name'] = element.querySelector(".accessible_elem").innerText;
          if(element.classList.contains("active")) {
            storeStartConnection(id, obj);
            element.classList.add("connected");
          }
        }
      }
      setConnectionObj(obj);
    });
  }, 5000);
};

window.onbeforeunload = function() {
  getConnectionObj(function(obj) {
    for(var i=0; i<ids.length; i++) {
      var id = ids[i];
      var element = document.querySelectorAll("[href='/messages/" + id + "']")[0].parentNode;
      if(element) storeEndConnection(id, obj);
    }
  });
};