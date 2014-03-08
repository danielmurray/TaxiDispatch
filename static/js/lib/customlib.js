function retrieveView(pane){
  
  var viewMap = {
    'home' : StatusView,
    'lights': LightView,
    'power': PowerView
  }
  console.log(pane)
  if (viewMap[pane.id]){
    viewToBeReturned = new viewMap[pane.id](pane);
  } else {
    viewToBeReturned = new PageView(pane);
  }

  return viewToBeReturned;
}


var cachedTemplates = {};
function loadTemplate(url) {

  // if (cachedTemplates[url]) {
  //   return cachedTemplates[url];
  // }

  var text;
 
  $.ajax({
   url: url,
   success: function(t) {
     //console.log(t);
     text = t;
   },
   error: function() {
       console.log('template loading is failing')
   },
   async: false
  });
  var tpl = _.template(text);
  cachedTemplates[url] = tpl;
  return tpl;
}

function loadData(url) {
   var data;
   $.ajax({
       url: url,
       success: function(d) {
           //console.log(d);
           data = d;
       },
       error: function() {
           return false;
       },
       async: false,
       dataType: "text"
    });
  return data;
}

var randomArray = function(start, end, size, seed){

  var arr = [];

  var now = start;
  var then = end;

  step = (now-then)/size;
  arr[0] = [];
  arr[0][0] = then;
  arr[0][1] = Math.random() * seed;

  for(var i=1; i<size; i++){
    arr[i] = [];
    arr[i][0] = then + step *i;
    
    arr[i][1] = arr[i-1][1] + (Math.random()*2 - 1)
  }

  return arr;
}

var stringToUTC = function(timeperiod){
  var now = Math.round((new Date()).getTime()/1000);
  
    switch(timeperiod){
      case 'today':
        var then = Math.round((new Date()).setHours(0,0,0,0)/1000);
        break;
      case 'last24':
        var then = now - 24*60*60;
        break;
      case 'thisweek':
        var then = Math.round(Date.create('monday').getTime()/1000)
        break;
      case 'last7':
        var then = now - 7*24*60*60;
        break;
      case 'thismonth':
        var then = Math.round(Date.create('the beginning of this month').getTime()/1000)
        break;
      case 'last28':
        var then = now - 28*24*60*60;
        break;
      default:
        var then = Math.round((new Date()).setHours(0,0,0,0)/1000);;
    }

  return {
    start: then,
    end: now
  }
}

var componentToHex = function(c) {
   var hex = c.toString(16);
   return hex.length == 1 ? "0" + hex : hex;
}

var rgbToHex = function(color) {
  r = color.r;
  g = color.g;
  b = color.b;

  if( r=="" ) r=0;
  if( g=="" ) g=0;
  if( b=="" ) b=0;
  if( r<0 ) r=0;
  if( g<0 ) g=0;
  if( b<0 ) b=0;
  if( r>255 ) r=255;
  if( g>255 ) g=255;
  if( b>255 ) b=255;

   return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var hexToRgb = function(hex) {
   var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
       return r + r + g + g + b + b;
   });

   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
       r: parseInt(result[1], 16),
       g: parseInt(result[2], 16),
       b: parseInt(result[3], 16)
   } : null;
}



var rgbaToString = function(color,opacity){
  var thing = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2]  + ',' + opacity + ')';

  return thing;
}

var hslToRgb = function(color){
  h = color.h
  s = color.s;
  l = color.l;

  if( h=="" ) h=0;
  if( s=="" ) s=0;
  if( l=="" ) l=0;
  if( h<0 ) h=0;
  if( s<0 ) s=0;
  if( l<0 ) l=0;
  if( h>=360 ) h=359;
  if( s>1 ) s=1;
  if( l>1 ) l=1;

  C = (1-Math.abs(2*l-1))*s;
  hh = h/60;
  X = C*(1-Math.abs(hh%2-1));
  r = g = b = 0;
  
  if( hh>=0 && hh<1 ) {
    r = C;
    g = X;
  } else if( hh>=1 && hh<2 ) {
    r = X;
    g = C;
  }
  else if( hh>=2 && hh<3 ) {
    g = C;
    b = X;
  } else if( hh>=3 && hh<4 ) {
    g = X;
    b = C;
  } else if( hh>=4 && hh<5 ) {
    r = X;
    b = C;
  } else {
    r = C;
    b = X;
  }

  m = l-C/2;
  r += m;
  g += m;
  b += m;
  r *= 255;
  g *= 255;
  b *= 255;

  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);

  return {
    'r': r,
    'g': g,
    'b': b
  }              
}

var rgbToHsl = function(color){
  r = color.r;
  g = color.g;
  b = color.b;

  if( r=="" ) r=0;
  if( g=="" ) g=0;
  if( b=="" ) b=0;
  if( r<0 ) r=0;
  if( g<0 ) g=0;
  if( b<0 ) b=0;
  if( r>255 ) r=255;
  if( g>255 ) g=255;
  if( b>255 ) b=255;

  r/=255;
  g/=255;
  b/=255;
  M = Math.max(r,g,b);
  m = Math.min(r,g,b);
  d = M-m;
  
  if( d==0 ) 
    h=0;
  else if( M==r ) 
    h=((g-b)/d)%6;
  else if( M==g ) 
    h=(b-r)/d+2;
  else 
    h=(r-g)/d+4;
  
  h*=60;
  
  if( h<0 ) 
    h+=360;
  
  l = (M+m)/2;
  
  if( d==0 )
    s = 0;
  else
    s = d/(1-Math.abs(2*l-1));

  return {
    'h': h,
    's': s,
    'l': l
  } 
}

var historyCollections = function(){
  return [
    {
      id: 'pv',
      name: 'PV',
      color: [85,160,85],
      collection: window.PV
    },
    {
      id: 'pyra',
      name: 'Sun',
      color: [170, 184, 26],
      collection: window.Pyra
    }, {
      id: 'power',
      name: 'Appliances',
      color: [173, 50, 50],
      collection: window.Power
    }, {
      id: 'flow',
      name: 'Water',
      color: [84, 175, 226],
      collection: window.Flow
    }, {
      id: 'temp',
      name: 'Temp',
      color: [173, 50, 50],
      collection: window.Temp
    }, {
      id: 'co2',
      name: 'CO2',
      color: [150, 111, 150],
      collection: window.CO2
    }, {
      id: 'humid',
      name: 'Humid',
      color: [84, 175, 226],
      collection: window.Humid
    }
  ]
}

var prettyDate = function(timestamp){
  // create a new javascript Date object based on the timestamp
  var date = new Date(timestamp);
  // hours part from the timestamp
  var hours = date.getHours();
  // minutes part from the timestamp
  var minutes = date.getMinutes();
  // seconds part from the timestamp
  var seconds = date.getSeconds();

  // will display time in 10:30:23 format
  var formattedTime = hours + ':' + minutes + ':' + seconds;

  return formattedTime
}

var biggestArray = function(arrays){

  var largestArrayIndex = 0; 
  var largestArrayCount = 0;

  for(var i = 0; i < arrays.length; i++){
    array = arrays[i]
    if(array.length > largestArrayCount){
      largestArrayIndex = i
    }
  }

  return arrays[largestArrayIndex]
}

var zeroedArray = function(size){

  var array = [];

  for(var i=0; i < size; i++){
    array.push(0);
  }

  return array
}

var allCountersLessThanSeries = function(counters, series){
  // given an array of counters returns true as long as all three
  // values are less than their corresponding array in the array of 
  // arrays


  if(counters.length != series.length)
    return false;

  var keepGoing = counters.length;

  for(var i=0; i < counters.length; i++){
    var counter = counters[i];
    var serie = series[i];

    var data = serie.data

    if( counter >= data.length){
      keepGoing--;
    } 
  }

  return keepGoing;
}

var smallestValueAtCounters = function( counters, arrays){
  // this function will return the smallest value at 
  // the indices supplied by the counters

  var smallestIndex = Number.MAX_VALUE;
  var pickedIndex = 0;

  for( var i =0; i < counters.length; i++){

    if( counters[i] < arrays[i].data.length){
      var valueAtIndex = arrays[i].data[counters[i]][0];

      if(valueAtIndex < smallestIndex){
        smallestIndex = valueAtIndex;
        pickedIndex = i;        
      }
    }

  }

  return smallestIndex;
}

var missingPoint = function(timestamp, index, data){
  // While graphing, there may be instances where one history data
  // has data for a specific timestamp and the other doesn't
  // this function computes what it would be by finding the mid point
  // between the value just before and after the timestamp


  var startX, endX, startY, endY;

  startX = endX = data[index][0]
  startY = endY = data[index][1]

  if( index != 0 ) {
    startX = data[index-1][0]
    startY = data[index-1][1] 
  }

  return calculateMidPoint(timestamp, startX, startY, endX, endY)

}

var calculateMidPoint = function(midX, startX, startY, endX, endY ){
  //this function is to calculate the mid point between
  //two x and y coordinates


  var deltaTime = endX - startX;
  var deltaY = 0;

  if( deltaTime != 0 ){
    var slope = (endY -startY)/deltaTime
    deltaY = slope * (midX - startX)
  }

  return startY + deltaY;

}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var arrayMax = function(array, func){
  //Cycles through an array and returns the
  //object with the largest value specified by
  // the functor

  if(!func){
    func = function(d){
      return d;
    }
  }

  var largestIndex = Math.floor(array.length/2);
  var largestValue = 0;

  for(var i=0; i < array.length; i++){
    arrayObj = array[i];

    var value = func(arrayObj);

    if( Math.abs(value) > largestValue){
      largestIndex = i;
      largestValue = value;
    }


  }

  return array[largestIndex]
}

