var TabView = Backbone.View.extend({
	el: "#debug",
	initialize: function() {
		this.tabId = 0;
	},
	add: function(name, sensor) {
		this.tabId += 1;
		var tab = $("<li><a href='#" + this.tabId + "'>" + name + "</a></li>");
		$("a", tab).click(function (e) {
      e.preventDefault();
      $(this).tab("show");
    });
		this.$("#tabs").append(tab);
		var tabContent = $("<div class='tab-pane' id='" + this.tabId + "'></div>");
		sensor.render();
		tabContent.append(sensor.$el);
		this.$("#content").append(tabContent);
	}
});

var SensorView = Backbone.View.extend({
	tagName: "div",
	initialize: function(collection) {
		this.collection = collection;
		this.collection.on("all", this.render, this);
		this.template = _.template($("#template-table").text());
	},
	render: function() {
		if (this.collection.size() > 0) {
			var fields = [];
			for (field in this.collection.models[0].toJSON()) {
				fields.push(field);
			}
			console.log("Fields", fields);
			this.$el.html(this.template({fields: fields, models: this.collection.models}));
		} else {
			this.$el.html("");
		}
	}
});

var tabView = new TabView();

var collections = [Lights, HVAC, PV, Temp, Pyra, Humid, CO2, Flow, Windoor, Power];
for (var i in collections) {
	var view = new SensorView(collections[i]);
	tabView.add(collections[i].url, view);
}

for (var col in collections) {
	collections[col].fetch();
}