// Models
var TaxiModel = ModelWS.extend({	
	initialize: function(xcoord, ycoord){
		this.status = 'parked'

		this.selector = 'taxi'+this.cid

		this.x = xcoord
		this.y = ycoord

		this.customers = new customerCollection

		this.pathTree = new PathTree(this.x, this.y)

	},

	potentialEffectientRoute: function(customer){
		goalStack = this.pathTree.getGoalStack()
		route = []
		if(goalStack.length == 0){
			//car is not moving and can be given a direct path
			route.push({
				coords: customer.destination,
				customer: customer
			})
			route.push({
				coords: customer.source,
				customer: customer
			})
			route.push({
				coords: this.getCoords(),
				customer: null
			})
		}else{
			//Car is in motion, there for we try to find the most
			//effecient way to fill in the new customer
			
			console.log(customer.source)

			goalStack.push

			for( var i = 0 ; i < goalStack.length; i++){

			}

			sourceIndex = 1 

		}

		return route
	
	},

	pickUp: function(customer){

		this.customers.add(customer)

	},

	dropOff: function(customer){

		this.customers.remove(customer)
		this.status='parked'

	},

	addAnimation: function(animateObj,animationOpt){

		if(this.animation){
			this.animation.queue = $(this.selector).animate(animateObj,animationOpt)
		}else{
			this.animation = $(this.selector).animate(animateObj,animationOpt)
		}
		
	},

	assignCustomer: function(customer){
		this.status = 'active'

		this.pathTree.pushGoal({
			coords: customer.destination,
			customer: customer
		})
		this.pathTree.pushGoal({
			coords: customer.source,
			customer: customer
		})

		this.nextDestination()
	},

	nextDestination: function(){
		goalStackHeight = this.pathTree.getGoalStackLength()

		if(goalStackHeight > 0){
			this.pathTree.buildPathToNextGoal({
				x: this.x,
				y: this.y
			})
			return true
		}else{
			return false
		}

	},      

	nextAnimation: function(){

		animationDetails = this.pathTree.popNextAnimation()
		
		this.x = animationDetails.x
		this.y = animationDetails.y

		return animationDetails

	}, 

	getCoords: function(){
		return {
			x: this.x,
			y: this.y
		}
	},

	getStatus: function(){
		return this.status
	},

	getStatusColor: function(){
		switch (this.status){
			case 'parked':
				return 'rgba(187, 0, 51, 1)'
			case 'active':
				return 'green'
			default:
				return 'black'
		}
	},
})

var customerModel = ModelWS.extend({
	initialize: function(coords, id){
		this.id = id
		this.source = coords
		this.source.type = 'src'

		this.status = 'waiting'
	},

	setDestination: function(coords){
		this.destination = coords
		this.destination.type = 'dest'
	},

	getIn: function(taxi){
		this.status = 'transit'
		this.taxi = taxi

		delete this.source
	},

	getOut: function(taxi){
		this.status = 'arrived'

		delete this.destination
	},

	getCoords: function(){
		return {
			x: this.source.x,
			y: this.source.y
		}
	},

	getSourceLocation: function(){
		return this.source
	},

	getDestinationLocation: function(){
		return this.destination
	}
})

