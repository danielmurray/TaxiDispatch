// Views, all inherit BaseView
var BaseView = Backbone.View.extend({
  initialize: function() {
  },

  assign: function(view, selector) {
    view.setElement(this.$(selector));
  },

  route: function(part, remaining) {
    return {};
  },

  dispose: function() {
    this.remove();
    this.off();
    if (this.model) {
      this.model.off(null, null, this);
    }
  }
});

var HomeView = BaseView.extend({
  el: "#viewport",
  events: {

  },
  initialize: function() {
    var that = this;

    this.template = loadTemplate("/views/nav.html");
  },
  route: function(part, remaining) {

    if (!part) {
      navigate("home", false); // don't trigger nav inside route
    }

    this.taxiDispatch = new TaxiDispatch()
    this.taxiDispatch.on('render', function(data){
      that.dispatchRequestedRender(data)
    })

    map = new MapDashboard({
      rows: 10,
      columns: 10,
      taxiDispatch: this.taxiDispatch
    })

    taxis = new Taxis({
      taxiCount: 3,
      taxiDispatch: this.taxiDispatch
    })

    return {
      "#dashboard": map,
      '#taxis-wrapper': taxis
    };


  },
  render: function() {
    var renderedTemplate = this.template({});
    this.$el.html(renderedTemplate);
  }
});


var MapDashboard = BaseView.extend({
  events: {
    "click .block":  "blockClick",
  },
  initialize: function(data) {
    var that = this;

    map = {}

    map.height = 768
    map.width = 717
    map.rowCount = data.rows
    map.colCount = data.columns
    map.intersectionWidth = Math.floor(map.width/map.colCount)
    map.intersectionHeight = Math.floor(map.height/map.rowCount)
    map.blockWidth = map.intersectionWidth * 0.4
    map.blockHeight =  map.intersectionHeight * 0.4
    map.roadWidth = map.intersectionWidth * 0.2
    map.roadHeight = map.intersectionHeight * 0.2

    this.map = map

    this.taxiDispatch = data.taxiDispatch
    this.taxiDispatch.initializeMap(this.map)

    this.template = loadTemplate("/views/map.html");
  },
  route: function(part, remaining) {

    that = this

    return {};

  },

  render: function() {
    var renderedTemplate = this.template({mapDetails:this.map, taxiDispatch:this.taxiDispatch});
    this.$el.html(renderedTemplate);
  },

  dispatchRequestedRender: function() {
    var renderedTemplate = this.template({mapDetails:this.map, taxiDispatch:this.taxiDispatch});
    this.$el.html(renderedTemplate);
  },

  blockClick: function(clickEvent){

    clickCoords = this.parseClickData(clickEvent)

    currCustomer = this.taxiDispatch.getCurrCustomer()

    if(currCustomer){
      this.newCustomerDestination(currCustomer,clickCoords)
    }else{
      this.newCustomerSource(clickCoords)
    }

  },

  newCustomerSource:function(customerCoord){
    this.taxiDispatch.customerSource(customerCoord)
  },

  newCustomerDestination:function(customer, goalCoord){
    this.taxiDispatch.customerDestination(customer, goalCoord)
  },

  parseClickData: function(clickEvent){
    block = $(clickEvent.target)
    blockPair = block.parent()
    intersection = blockPair.parent()
    id = intersection[0].id
    coord = id.split('intersect')[1].split('-')
    x = coord[0]
    y = coord[1]
    northSouth = block[0].classList[0]
    westEast =  block[0].classList[1]
    return {
      x: Number(x),
      y: Number(y),
      northSouth: northSouth,
      westEast: westEast
    }
  }

});

var Taxis = BaseView.extend({
  events: {

  },
  initialize: function(data) {
    var that = this;

    this.taxiDispatch = data.taxiDispatch
    this.taxiCount = data.taxiCount

    this.taxiDispatch.spawnRandomTaxis(this.taxiCount)
    this.map = this.taxiDispatch.getMap()

    this.template = loadTemplate("/views/taxis.html");
  },
  route: function(part, remaining) {

    return {};

  },
  render: function() {
    var renderedTemplate = this.template({
      mapDetails: this.map,
      taxiDispatch:this.taxiDispatch
    });
    this.$el.html(renderedTemplate);
  }
});

var CustomerList = BaseView.extend({
  events: {

  },
  initialize: function(data) {
    var that = this;

    this.taxiDispatch = data.taxiDispatch

    this.template = loadTemplate("/views/customerList.html");
  },
  route: function(part, remaining) {

    return {};

  },
  render: function() {
    var renderedTemplate = this.template({
      mapDetails: this.map,
      taxiDispatch:this.taxiDispatch
    });
    this.$el.html(renderedTemplate);
  }
});

