// Main controller/router

$(function() {
  var Home = new HomeView();
  var Router = Backbone.Router.extend({
    routes: {
      '*path': 'displayUrl'
    },
    rootView: Home,
    currentPath: [], // holds the /split/path/pieces/here
    currentViews: [], // each index holds a list of all views for that path part
    displayPart: function(level, currentView, remainingPath) {
      remainingPath = remainingPath.slice();
      //console.log("Displaying", level, currentView, remainingPath);
      var part = remainingPath.shift();
      //console.log(remainingPath)
      var subviews = currentView.route(part, remainingPath); // returns a dict
      //consoles.log("View", currentView, "creating subviews", subviews);
      //console.log(currentView)
      currentView.render(); // re-render parent view before attaching children
      currentView.trigger("assign");
      var allCreatedViews = this.currentViews[level];
      if (allCreatedViews == undefined) {
        allCreatedViews = [];
        this.currentViews[level] = allCreatedViews;
      }
      for (var name in subviews) {
        var subview = subviews[name];

        allCreatedViews.push(subview);
        currentView.assign(subview, name);
        this.displayPart(level+1, subview, remainingPath);
      }
    },
    displayUrl: function(path) {
      //console.log("Displaying", path, this);
      // split the path by "/"s, then recursively create the new view

      var pathParts = path.split("/");
      // find the path difference
      // []
      // ["control", "lights"] diffIdx = 0
      // ["control", "heat"] diffIdx = 1
      // ["history", "lights"] diffIdx = 0
      //console.log(this.currentViews);
      //console.log(this.currentPath);
      //console.log(pathParts);

      var diffIdx;
      for (diffIdx = 0; diffIdx < Math.min(this.currentPath.length, pathParts.length); diffIdx++) {
        if (this.currentPath[diffIdx] != pathParts[diffIdx]) {
          break;
        }
      }

      // tear down old views, there may be more views than the path length
      for (var teardownIdx = this.currentViews.length-1; teardownIdx >= diffIdx; teardownIdx--) {
        //console.log("Destroying view level", teardownIdx, "pathpart", this.currentPath[teardownIdx]);
        for (var viewIdx in this.currentViews[teardownIdx]) {
          //console.log("View", this.currentViews[teardownIdx]);
          var view = this.currentViews[teardownIdx][viewIdx];
          view.trigger("dispose");
          view.dispose();
        }
      }

      // set up new views
      this.currentViews = this.currentViews.slice(0, diffIdx);
      for (var i = diffIdx; i < pathParts.length; i++) {
        this.currentViews[i] = [];
      }

      if (diffIdx == 0) {
        // no parts are the same
        this.displayPart(0, this.rootView, pathParts);
      } else {
        //console.log(this.currentViews)
        for (var viewIdx in this.currentViews[diffIdx-1]) {
          var view = this.currentViews[diffIdx-1][viewIdx];
          this.displayPart(diffIdx, view, pathParts.slice(diffIdx, pathParts.length));
        }
      }
      //console.log("Path parts", pathParts);
      this.currentPath = pathParts;
     //console.log("Views after displayUrl", this.currentViews);
    },
    rerender: function(){
      return this.displayPart(0, this.rootView, this.currentPath);      
    }
  });

  window.router = new Router();

  window.navigate = function(str, noTrigger) {
    //console.log("Navigating to", str, noTrigger);
    router.navigate(str, {
      trigger: !noTrigger
    });
    router.currentPath = str.split("/");
  };

  window.rerender = function() {
    //console.log("Navigating to", str, noTrigger);
    return router.rerender();
  };

  // Only fetch non-debug collections
  // window.Collections = [Lights, HVAC, PV, Temp, Pyra, Humid, CO2, Flow, Windoor, Power];

  Backbone.history.start();

});