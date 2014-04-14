(function () {

  var testEvents = [
    {start: 30, end: 150},
    {start: 540, end: 600},
    {start: 560, end: 620},
    {start: 610, end: 670},
  ];

  var testEvents2 = [
    {start: 30, end: 150},
    {start: 170, end: 220},
    {start: 200, end: 310},
    {start: 240, end: 290},
    {start: 305, end: 360},
    {start: 325, end: 410},
    {start: 400, end: 460},
    {start: 420, end: 490},
    {start: 440, end: 510},
    {start: 455, end: 550},
    // {start: 450, end: 540},
  ];

  var canvas = document.getElementById('calendar-canvas'),
      gutter = document.getElementById('calendar-gutter'),
      minutesToPixelsRatio = 1;

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
    canvas.innerHTML = '';
    var fragment = document.createElement('div');
    fragment.className = 'calendar-canvas-container';
    for(var i = 0; i < events.length ; i++) {
      var calendarItem = document.createElement('div');
      calendarItem.className = 'calendar-event';
      calendarItem.innerHTML = '<h2 class="event-title">Sample Item</h2><p class="event-location">Sample Location</p>';
      calendarItem.style.top = (events[i].start * minutesToPixelsRatio) + 'px';
      calendarItem.style.width = events[i].width * 600 + 'px';
      calendarItem.style.left = events[i].left + 'px';
      var dif = events[i].end - events[i].start;
      // console.log(dif);
      calendarItem.style.height = (dif * minutesToPixelsRatio) + 'px';
      fragment.appendChild(calendarItem);
      // console.log(events[i]);
    }
    canvas.appendChild(fragment);
  }

  function buildGraph (events) {
    var graph = new Graph();
    for (var i = 0; i < events.length; i++) {
      graph.addNode(events[i]);
    };
    return graph;
  }

  function layoutGroup (node) {
    var reachableNodes = node.getAllReachableNodes();
    if(reachableNodes[0].measured) {
      return;
    }
    // sort by start time
    reachableNodes = _.sortBy(reachableNodes, function (node) {
      return node.data.start;
    });
    console.log(reachableNodes);
    var nConnections = 0;
    var maxConnections = 0;
    var width = 1;
    var offset;
    // find out the most collisions to determine width
    for(var i = 0; i < reachableNodes.length ;i++) {
      nConnections = reachableNodes[i].sharedNeighbors().length + 1;
      if(nConnections > maxConnections) {
        maxConnections = nConnections;
      }
    }
    width = 1 / maxConnections;
    offset = 600 * width;
    // set the width of all nodes
    for (var j = reachableNodes.length - 1; j >= 0; j--) {
      reachableNodes[j].data.width = width;
      reachableNodes[j].measured = true;
    };

    // set the left position of all nodes
    // console.log(reachableNodes);
    reachableNodes[0].data.left = 0;
    for (var h = 1; h < reachableNodes.length; h++) {
      var neighborsData = _.map(reachableNodes[h].neighbors, function (node) {
        return node.data;
      });
      console.log(neighborsData);
      if(_.some(neighborsData,{'left': 0}) === false) {
        reachableNodes[h].data.left = 0;
      }
      else {
        console.log();
        reachableNodes[h].data.left = _.max(neighborsData, 'left').left + offset;
      }
    };
  }

  function layoutPass (graph) {
    for(var i = 0; i < graph.nodes.length ; i++) {
      // if no neighbors then its simply 100% width
      if(graph.nodes[i].neighbors.length === 0){
        graph.nodes[i].data.width = 1;
        graph.nodes[i].data.left = 0;
      }
      else {
        // need to find a way to avoid calling this on the same group over
        // and over because each node is stored in the adjacency list
        // regardless of whether or not its part of a collision group
        layoutGroup(graph.nodes[i]);
      }
    }
    // then set all connected nodes to same width and position off left
  }

  function layOutDay (events) {
    var graph = buildGraph(events);
    layoutPass(graph);
    console.log(graph);
    renderGroup(events);
    window.g = graph;
  }


  renderCalendarGutter();
  layOutDay(testEvents);
  // layOutDay(testEvents2);

  window.layOutDay = layOutDay;

}());