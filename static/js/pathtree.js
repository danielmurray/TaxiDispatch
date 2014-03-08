//Path tree definition
var PathTree = function(){
	this.goalStack = [];
	this.currPath = []
}

PathTree.prototype.pushGoal = function(goal) {
	this.goalStack.push(goal)
};

PathTree.prototype.concat = function(goal) {
	this.goalStack = this.goalStack.concat(goal)
};

PathTree.prototype.popGoal = function(goal) {
	return this.goalStack.pop(goal)
};

PathTree.prototype.peek = function(goal) {
	nextGoal = this.goalStack.pop(goal)
	this.goalStack.push(nextGoal)
	return nextGoal
};

PathTree.prototype.getGoalStackLength = function(goal) {
	return this.goalStack.length
};

PathTree.prototype.getGoalStack = function() {
	return this.goalStack
};

PathTree.prototype.popNextAnimation = function(){
	return this.path.pop()
},

PathTree.prototype.buildPathToNextGoal = function(currentPosition) {
	nextGoalObj = this.peek()
		
	this.root = new PathTreeNode(currentPosition.x,currentPosition.y);
	this.path = this.root.randomPathStack(nextGoalObj)
};

PathTree.prototype.printCurrentPath = function(goal) {
	for(var i = 0; i < this.path.length; i++){
		step = this.path[i]
		console.log(step)
	}
};


//These next two functions aren't really used
//as they create all possible
PathTree.prototype.build = function(goal) {
	console.log('hello')
	this.pushGoal(goal)
	this.goal=this.goalStack[0]
	this.root.buildTreeNode(goal)
};

PathTree.prototype.randomPath = function(goal) {
	randomPath = this.root.randomPathStack(goal)
	return randomPath
};


//Path tree node definition
var PathTreeNode = function(x,y,step){
	this.x = x
	this.y = y
	this.pathTo = step
	this.children = []
}

PathTreeNode.prototype.getCoords = function(){
	return{
		x: this.x,
		y: this.y
	}
};

PathTreeNode.prototype.printChildren = function(){
	childDirecections = []
	for(var i = 0; i < this.children.length; i++){
		child = this.children[i]
		childDirecections.push(child.pathTo)
	}
	console.log(childDirecections)
};

PathTreeNode.prototype.manhattanDistance = function(x1, y1, x2, y2){
    xDelta = Math.abs(x1 - x2)
    yDelta = Math.abs(y1 - y2)
    distance = xDelta + yDelta
    return distance
}

PathTreeNode.prototype.distanceFrom = function(x2, y2){
    return this.manhattanDistance( this.x, this.y, x2, y2)
}

PathTreeNode.prototype.findChildren = function(goalCoords){

	currDistance = this.distanceFrom(goalCoords.x, goalCoords.y)

	west = new PathTreeNode(this.x-1, this.y, 'west')
	east = new PathTreeNode(this.x+1, this.y, 'east')		
	north = new PathTreeNode(this.x, this.y-1, 'north')
	south = new PathTreeNode(this.x, this.y+1, 'south')

	potentialSteps = []
	potentialSteps.push(north, south, east, west)

	children = []

	for(var i = 0; i < potentialSteps.length; i++){
		step = potentialSteps[i]
		stepDistance = step.distanceFrom(goalCoords.x, goalCoords.y)

		if(stepDistance < currDistance){
			children.push(step)
		}
	}

	return children

};

PathTreeNode.prototype.buildTreeNode = function(goalObj){

	children = this.findChildren()
	for(var i = 0; i < children.length; i++){
		child = children[i]
		child.buildTreeNode(goalObj)
	}
};

PathTreeNode.prototype.randomPathStack = function(goal){
	
	goalCoords = goal.coords
	children = this.findChildren(goalCoords)

	//This signifies we have arrived next goal
	if(children.length == 0){
		return [{
			x: goalCoords.x,
			y: goalCoords.y,
			status: goalCoords.type,
			customer: goal.customer
		}]		
	}

	//Pick a random next step towards goal
	childIndex = Math.floor(Math.random()*children.length)
	this.child = children[childIndex]

	stack = this.child.randomPathStack(goal)
	path = this.child.pathSteps()

	stack.push(path)

	return stack

};

PathTreeNode.prototype.pathSteps = function(){

	switch (this.pathTo){
		case 'north':
			return {
					x: this.x,
					y: this.y+1,
					axis: 'y',
					direction: -1,
				}
		case 'south':
			return {
					x: this.x,
					y: this.y-1,
					axis: 'y',
					direction: 1
				}
		case 'east':
			return {
					x: this.x-1,
					y: this.y,
					axis: 'x',
					direction: 1
				}
		case 'west':
			return {
					x: this.x+1,
					y: this.y,
					axis: 'x',
					direction: -1
				} 
	}
}

