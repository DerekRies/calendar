(function () {

  var testEvents = [
    {start: 30, end: 150},
    {start: 540, end: 600},
    {start: 560, end: 620},
    {start: 610, end: 670},
  ];

  var testEvents2 = [
    // {start: 30, end: 150},
    {start: 180, end: 210},
    {start: 200, end: 310},
    {start: 270, end: 290},
    {start: 305, end: 330},
    {start: 325, end: 410},
    {start: 400, end: 460},
    {start: 420, end: 490},
    {start: 440, end: 510},
  ];

  var canvas = document.getElementById('calendar-canvas'),
      gutter = document.getElementById('calendar-gutter'),
      minutesToPixelsRatio = 0.995;

  function isCollision (eventA, eventB) {
    if(eventB.start > eventA.end || eventB.end < eventA.start ){
      return false;
    }
    return true;
  }

  // Creates the gutter on the side of the calendar that displays
  // the times ranging from 9 am to 9 pm
  function renderCalendarGutter () {
    var allTimesDOM = document.createElement('div');
    console.log('rendering the calendar gutter');
    for(var i = 0 ; i < 25 ; i++) {
      var timeDOM = document.createElement('div');
      timeDOM.className = 'time';
      var time = 30 * i + 540; //540 = 9am
      var hours = Math.floor(time / 60);
      var abbr = hours >= 12 ? 'PM': 'AM';
      hours = hours === 12 ? 12 : hours % 12;
      var minutes = time % 60;
      minutes = minutes !== 30 ? '00' : '30';
      // console.log(hours + ':' + minutes + ' ' + abbr);
      timeDOM.style.top = Math.floor((time - 540) * minutesToPixelsRatio) + 'px';
      if(minutes === '00') {
        timeDOM.innerHTML = '<span class="big-time">' + hours + ':' + minutes
                              + ' ' + '</span> ' + abbr;
      }
      else {
        timeDOM.classList.add('time-small');
        timeDOM.innerHTML = hours + ':' + minutes;
      }
      allTimesDOM.appendChild(timeDOM);
    }
    gutter.appendChild(allTimesDOM);
  }

  /*
  Handles the painting/rendering of a collection of events to the screen.
  Layout (sizing and placement) is handled in the layout function.
   */
  function renderGroup (events) {
    var fragment = document.createElement('div');
    fragment.className = 'calendar-canvas-container';
    for(var i = 0; i < events.length ; i++) {
      var calendarItem = document.createElement('div');
      calendarItem.className = 'calendar-event';
      calendarItem.innerHTML = '<h2 class="event-title">Sample Item ' + i + '</h2><p class="event-location">Sample Location</p>';
      calendarItem.style.top = (events[i].start * minutesToPixelsRatio) + 'px';
      calendarItem.style.width = events[i].width * 100 + '%';
      calendarItem.style.left = events[i].left + 'px';
      var dif = events[i].end - events[i].start;
      // console.log(dif);
      calendarItem.style.height = (dif * minutesToPixelsRatio) + 4 + 'px';
      fragment.appendChild(calendarItem);
      // console.log(events[i]);
    }
    canvas.appendChild(fragment);
  }

  function layOutDay(events) {
    var collisions;
    for (var i = 0 ; i < events.length - 1 ; i++) {
      collisions = [events[i]];
      for (var j = i + 1 ; j < events.length ; j++) {
        if(events[i] !== events[j]) {
          if(isCollision(events[i], events[j])){
            collisions.push(events[j]);
            console.log('collision between ' + i + ' ' + j);
          }
        }
      }
      if(collisions.length > 1){
        console.log(i);
        console.log(collisions);
      }
      for (var k = 0; k < collisions.length ; k++) {
        collisions[k].width = 1/collisions.length;
      }
      console.log(events[i]);
    }
    renderGroup(events);
  }

  function buildGraph (events) {
    var graph = new Graph();
    for (var i = 0; i < events.length; i++) {
      graph.addNode(events[i]);
    };
    return graph;
  }

  function findMostConnections (node) {
    var visitedNodes = [node],
        mostConnections = 0,
        curNode = node,
        prevNode = node;
    // Go through each node
    // how many neighbors?
    // how many of those neighbors are shared neighbors
    // (all colliding with each other)
    while(true) {
      if(curNode.neighbors.length === 1) {
        if(mostConnections < 1) {
          mostConnections = 1;
        }
        prevNode = curNode;
        curNode = curNode.neighbors[0];
      }
      else {
        break;
      }
    }
  }

  function layoutPass (graph) {
    for(var i = 0; i < graph.nodes.length ; i++) {
      // if no neighbors then its simply 100% width
      if(graph.nodes[i].neighbors.length === 0){
        graph.nodes[i].data.width = 100;
        graph.nodes[i].data.left = 0;
      }
      else {
        // Go through the graph to find the most connected point.
        // mostConnections = findMostConnections(graph.nodes[i]);
        console.log(graph.nodes[i].sharedNeighbors());
      }
    }
    // then set all connected nodes to same width and position off left
  }

  function ld (events) {
    var graph = buildGraph(events);
    layoutPass(graph);
    console.log(graph);
    window.g = graph;
  }


  renderCalendarGutter();
  // layOutDay(testEvents);
  // ld(testEvents);
  ld(testEvents2);

  window.layOutDay = layOutDay;

}());