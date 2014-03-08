
/*
 * WebSocket extensions for Backbone.Model and Backbone.Collection
 *
 * The calls to CollectionWS.fetch() will open a socket.io connection to the
 * namespace specified in the collection definition url {url: "/foo"}. This
 * socket listens for updates 
 *
 * Updates made to client-side models can be pushed to the server via the
 * namespace socket as well. Only "update" is supported. These updates contain 
 * a transaction ID. An event with the transaction ID name will be triggered
 * with the result of the update operation {success: true/false}.
 */

function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function uid() {
  return (S4()+S4()+S4());
}

var CollectionWS = Backbone.Collection.extend({
  sync: function(method, collection, options) {
    var socket = collection.getSocket();
    switch (method) {
      case "read":
        // Return an array  of models for this collection
        var tid = uid();
        socket.emit("fetch", {tid: tid});
        socket.once(tid, function(response) {
          // console.log(tid, response);
          if (response.success) {
            options.success(collection, response.data, options);
          }
        });
        break;
      default:
        console.error("Invalid sync call on collection", collection, method);
    }
  },

  getSocket: function() {
    if (!this._socketio) {
      this._socketio = io.connect(this.url);
      var obj = this;
      this._socketio.on("update", function(data) {
        // data contains an array of model objects to be updated
        obj.add(data, {merge: true});
      });
    }
    return this._socketio;
  }
});

var ModelWS = Backbone.Model.extend({
  sync: function(method, model, options) {
    var socket = model.getSocket();
    switch (method) {
      case "update":
        // send local changes to the server
        var tid = uid();
        socket.emit("save", {tid: tid, data: model.toJSON()});
        socket.once(tid, function(response) {
          console.log(tid, response);
          if (response.success) {
            options.success(response.data);
          }
        });
        break;
      default:
        console.error("Invalid sync call on model", model, method);
    }
  },

  getSocket: function() {
    if (this.collection) {
      return this.collection.getSocket();
    }
    if (!this._socketio) {
      this._socketio = io.connect(this.urlRoot);
      this._socketio.on("update", function(data) {
        // data contains the model object
        this.set(data);
      });
    }
  }
});

