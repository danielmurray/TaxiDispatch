// Models
var TaxiModel = ModelWS.extend({	
	initialize: function(xcoord, ycoord){
		this.status = 'parked'

		this.selector = 'taxi'+this.cid

		this.x = xcoord
		this.y = ycoord

		this.customers = new customerCollection

		this.pathTree = new PathTree()

	},

	pickUp: function(customer){

		this.customers.add(customer)
		console.log('here we should pop off goal stack')
		console.log(this.pathTree.getGoalStack())
		this.pathTree.popGoal()
		console.log(this.pathTree.getGoalStack())

	},

	dropOff: function(customer){

		this.customers.remove(customer)
		this.status='parked'
		console.log('here we should pop off goal stack')
		console.log(this.pathTree.getGoalStack())
		this.pathTree.popGoal()
		console.log(this.pathTree.getGoalStack())

	},

	addAnimation: function(animateObj,animationOpt){

		if(this.animation){
			this.animation.queue = $(this.selector).animate(animateObj,animationOpt)
		}else{
			this.animation = $(this.selector).animate(animateObj,animationOpt)
		}
		
	},

	currentPath: function(customer){
		return this.pathTree.getGoalStack()
	},

	potentialPathWith: function(customer){

		goalStack = this.pathTree.getGoalStack().concat()

		customerStack = [{
			coords: customer.destination,
			customer: customer
		},{
			coords: customer.source,
			customer: customer
		}]

		//Current Location
		CL = {	
			coords: {
				x: this.x, 
				y: this.y
			}
		}

		potentialPathWithCustomer = []

		while (true){
			if(goalStack.length == 0){
				potentialPathWithCustomer = potentialPathWithCustomer.concat(customerStack)
				break
			}else if(customerStack.length == 0){
				potentialPathWithCustomer = potentialPathWithCustomer.concat(goalStack)
				break
			}else{

				//Next Goal Destination
				NGD = goalStack.splice(-1)[0]
				//Next Customer Destination
				NCD = customerStack.splice(-1)[0]

				distanceToNGD = this.manhattanDistance(CL, NGD)
				distanceToNCD = this.manhattanDistance(CL, NCD)

				if(distanceToNCD < distanceToNGD){
					//next customer destination is closer
					NCD = goalStack.pop()
					potentialPathWithCustomer.unshift(NCD)
					CL = NCD
				}else{
					//next original customer stack is closer
					NGD = goalStack.pop()
					potentialPathWithCustomer.unshift(NGD)
					CL = NGD
				}

			}	
		}

		return potentialPathWithCustomer

	},

	calculateRouteDistance: function(route){

		routeStack = route.concat()

		totalRouteDist = 0

		routeStack.push({
			coords: {
				x: this.x,
				y: this.y
			}
		})

		for(var i=0; i < routeStack.length - 1; i++){
			routeSrc = routeStack[i]
			routeDest = routeStack[i+1]
			dist =  this.manhattanDistance(routeSrc, routeDest)
			totalRouteDist = totalRouteDist + dist
		}

		return totalRouteDist
	},

	manhattanDistance: function(src, dest){
		srcco = src.coords
		destco = dest.coords
		return manhattanDistance(srcco.x, destco.x, srcco.y, destco.y)
	},

	assignCustomer: function(customer, path){
		this.status = 'active'

		this.pathTree.concat(path)

		this.nextDestination()
	},

	nextDestination: function(){
		goalStackHeight = this.pathTree.getGoalStackLength()

		console.log(goalStackHeight)
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

