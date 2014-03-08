// Collection definitions
var customerCollection = Backbone.Collection.extend({
  model: customerModel,
})

var TaxiDispatch = Backbone.Collection.extend({
  model:TaxiModel,
  customers: new customerCollection,
  
  initializeMap: function(mapDetails) {
    
    this.mapDetails = mapDetails
    this.animationSpeed = 500

  },

  waitForRender: function(){
    this.trigger('render')
  },

  dispatch: function(taxi){

    var that = this

    animationDetails = taxi.nextAnimation()
    
    animateObj = {}
    
    if(animationDetails.axis){
      if(animationDetails.axis == 'x'){

        xStart = this.getX(taxi)
        animateObj.left = xStart + this.mapDetails.intersectionWidth * animationDetails.direction

      }else{

        yStart = this.getY(taxi)
        animateObj.top = yStart + this.mapDetails.intersectionHeight * animationDetails.direction
      
      }

      $('#' + taxi.selector).animate(animateObj,{
        duration: this.animationSpeed,
        easing: 'linear',
        queue: true,
        complete: function(){
          that.dispatch(taxi)
        }
      })
    }else{
      //code for pickups and dropoffs
      status = animationDetails.status
      if(status == 'src'){
        //pickup
        this.pickUp(taxi, customer)
        this.waitForRender()
      }else if(status == 'dest'){
        //dropoff
        this.dropOff(taxi, customer)
        this.waitForRender()
      }

      if( taxi.nextDestination() ){
        this.dispatch(taxi)
      }else{
      }
    }
    
  },

  spawnRandomTaxis: function(taxiCount){
    for( var i = 0; i < taxiCount; i++){
      xcoord = Math.floor(Math.random()* this.mapDetails.colCount)
      ycoord = Math.floor(Math.random()* this.mapDetails.rowCount)
      this.spawnTaxi(xcoord,ycoord)
    }
  },

  spawnTaxis: function(taxis){
    for( var i = 0; i < taxis.length; i++){
      taxi_data = taxis[i]
      this.spawnTaxi(taxi_data.x, taxi_data.y) 
    }
  },

  spawnTaxi: function(xcoord, ycoord){
    taxi = new TaxiModel(xcoord, ycoord)  
    this.add(taxi)
  },

  customerSource: function(customerCoords){

    customerIndex = this.customers.length + 1
    this.currCustomer = new customerModel(customerCoords,customerIndex)
    this.customers.add(this.currCustomer)

    this.waitForRender()

  },

  customerDestination: function(customer, destination){

    //I suck to hard for these values
    //to self update, so taxis need to stop
    //to compute the most effecient path

    delete this.currCustomer

    customer.setDestination(destination)

    // cheapestTaxi = this.cheapestTaxi(customer)
    
    mostEffecientTaxiObj = this.mostEffecientTaxiWith(customer)

    mostEffecientTaxi = mostEffecientTaxiObj.taxi
    mostEffecientPath = mostEffecientTaxiObj.potentialPath
    mostEffecientTaxi.assignCustomer(customer, mostEffecientPath )

    this.waitForRender()
    this.dispatch(mostEffecientTaxi)

  },

  pickUp: function(taxi, customer){

    taxi.pickUp(customer)
    customer.getIn(taxi)

  },

  dropOff: function(taxi, customer){

    customer.getOut()
    taxi.dropOff(customer)

  },

  getCurrCustomer: function(){

    return this.currCustomer

  },

  getMap: function(){
    return this.mapDetails
  },


  cheapestTaxi: function(customer){

    customer = customer.getCoords()
    taxiDistArray = []
    for(var i = 0; i < this.models.length; i++){
      taxi = this.models[i]
      distance = this.manhattanDistance(customer, taxi.getCoords())
      taxiDistArray.push([taxi, distance])
    }

    taxiDistArray.sort(function(a, b){
      return a[1]-b[1]
    })

    return taxiDistArray[0][0]
  },

  potentialPathsWith: function(customer){

    potentialPaths = []

    for (var i=0; i < this.models.length; i++) {
      taxi = this.models[i]
      
      currPath = taxi.currentPath()
      currPathLength = taxi.calculateRouteDistance(currPath)

      newPath = taxi.potentialPathWith(customer)
      newPathLength = taxi.calculateRouteDistance(newPath)

      taxiObj = {
        taxi: taxi,
        potentialPath: newPath,
        extraGas: newPathLength - currPathLength
      }

      potentialPaths.push(taxiObj)

    }

    return potentialPaths
  },

  mostEffecientTaxiWith: function(customer){

    taxis = this.potentialPathsWith(customer)

    sortedTaxis = taxis.sort(function compare(a,b) {
      if (a.extraGas < b.extraGas)
         return -1;
      if (a.extraGas > b.extraGas)
        return 1;
      return 0;
    });

    for(var i = 0; i < sortedTaxis.length; i++){
      taxi = sortedTaxis[i]
      console.log(taxi.taxi.cid, taxi.extraGas)
    }

    return sortedTaxis[0]
  },

  getCoord: function(taxi){
    graphX = this.getX(taxi)
    graphY = this.getY(taxi)
    return {
      x: graphX,
      y: graphY
    }
  },

  getX: function(taxi){
    x = taxi.x
    graphX = x * this.mapDetails.intersectionWidth + this.mapDetails.blockWidth
    return graphX
  },

  getY: function(taxi){
    y = taxi.y
    graphY = y * this.mapDetails.intersectionHeight + this.mapDetails.blockHeight
    return graphY
  },

  manhattanDistance: function(customer, taxi){
    console.log(customer, taxi)
    return manhattanDistance(customer.x, taxi.x, customer.y, taxi.y)
  },

  blockCustomers: function(blockLocation){
    //maybe we should have a location model???
    
    blockCustomers = []

    for(var i=0; i< this.customers.length; i++ ){
      customer = this.customers.models[i]

      sourceLocation = customer.getSourceLocation()

      if( this.locationCheck(sourceLocation,blockLocation) ){
        blockCustomers.push({
          type: 'src',
          customer: customer
        })
      }

      destinationLocation = customer.getDestinationLocation()

      if( this.locationCheck(destinationLocation,blockLocation) ){
        blockCustomers.push({
          type: 'dest',
          customer: customer
        })
      }
    }

    return blockCustomers  
  },

  locationCheck: function(l1, l2){
    
    if(l1){
      if(l1.x == l2.x){
        if(l1.y == l2.y){
          if(l1.northSouth == l2.northSouth){
            if(l1.westEast == l2.westEast){
              return true
            }
          }
        }
      }
    }
    return false
  }


})


