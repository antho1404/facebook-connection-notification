var optimizedConnections = function(connections) {
  return connections;
  // if(!connections) return null;
  // var filtered_connections = [];
  // for(var i=0; i<connections.length; i++) {
  //   var item = connections[i];
  //   var last = filtered_connections.length > 0 ? filtered_connections[filtered_connections.length - 1] : null;
  //   if(!last) {
  //     filtered_connections.push(item);
  //     continue;
  //   }
  //   if(item.start <= last.end + 30 * 1000) {
  //     last.end = item.end;
  //   } else {
  //     filtered_connections.push(item);
  //   }
  // }
  // return connections;
};


var getConnectionObj = function(id, callback, obj) {
  if(obj) return callback(id, obj);
  chrome.storage.sync.get(id.toString(), function(data) {
    if(!data) data = {};
    if(data[id]) data = data[id];
    if(!data['connections']) data['connections'] = [];
    if(callback)
      callback(parseInt(id, 10), data);
  });
};

var setConnectionObj = function(id, obj, callback) {
  obj['connections'] = optimizedConnections(obj['connections']);
  var a = {};
  a[id.toString()] = obj;
  chrome.storage.sync.set(a, function() {
    if(callback)
      callback(id);
  });
};

