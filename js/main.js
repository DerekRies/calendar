(function () {

  var testEvents = [
    {start: 30, end: 150},
    {start: 540, end: 600},
    {start: 560, end: 620},
    {start: 610, end: 670},
  ];

  var testEvents3 = [
    {start: 30, end: 400},
    {start: 50, end: 400},
    {start: 70, end: 400},
    {start: 90, end: 400},
    {start: 110, end: 400},
    {start: 130, end: 400},
    {start: 150, end: 400},
    {start: 170, end: 400},
    {start: 190, end: 420},
    {start: 230, end: 440},
    {start: 250, end: 500},
    {start: 470, end: 540},
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
    {start: 550, end: 640},
    {start: 650, end: 700},
    {start: 670, end: 720},
  ];

  var canvas = document.getElementById('calendar-canvas'),
      gutter = document.getElementById('calendar-gutter'),
      minutesToPixelsRatio = 1;

  // Creates the gutter on the side of the calendar that displays
  // the times ranging from 9 am to 9 pm
  function renderCalendarGutter () {
    var allTimesDOM = document.createElement('div');
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
    var nConnections = 0;
    var maxConnections = 0;
    var maxC = [];
    var width = 1;
    var offset;

    // find out the most collisions to determine width
    for(var i = 0; i < reachableNodes.length ;i++) {
      var sharedNeighbors = reachableNodes[i].sharedNeighbors()
      nConnections = sharedNeighbors.length + 1;
      if(nConnections > maxConnections) {
        maxConnections = nConnections;
        maxC = sharedNeighbors;
      }
    }
    console.log(maxConnections);
    console.log(maxC);
    width = 1 / maxConnections;
    offset = 600 * width;

    // set the width of all nodes
    for (var j = reachableNodes.length - 1; j >= 0; j--) {
      reachableNodes[j].data.width = width;
      reachableNodes[j].measured = true;
    };

    // set the left position of all nodes
    reachableNodes[0].data.left = 0;
    for (var h = 1; h < reachableNodes.length; h++) {
      var neighborsData = _.map(reachableNodes[h].neighbors, function (node) {
        return node.data;
      });
      // There's room to put this event on the left
      // Doesn't take into account room on the left, after the first slot
      // (the first slot being a left of 0)
      if(_.some(neighborsData,{'left': 0}) === false) {
        reachableNodes[h].data.left = 0;
      }
      // This node's neighbors are pushing it further to the right
      else {
        console.log();
        var maxOffset = _.max(neighborsData, 'left').left;
        if(maxOffset + offset <= 600) {
          reachableNodes[h].data.left = maxOffset + offset;
        }
        else{
          reachableNodes[h].data.left = 0;
        }
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
        layoutGroup(graph.nodes[i]);
      }
    }
  }

  function layOutDay (events) {
    _.sortBy(events, function (e) {
      return e.start;
    });
    var graph = buildGraph(events);
    layoutPass(graph);
    console.log(graph);
    renderGroup(events);
    window.g = graph;
  }


  renderCalendarGutter();
  // layOutDay(testEvents);
  layOutDay(testEvents2);

  function generateTestEvents (n) {
    var events = [];
    if(typeof n === 'undefined') {
      n = Math.floor(Math.random()*100);
    }

    function generateEvent () {
      var e = {};
      var height = Math.random() * 100 + 50;
      e.start = Math.random() * (720 - height);
      e.end =  height + e.start;
      return e;
    }

    for (var i = 0; i < n; i++) {
      events.push(generateEvent());
    }

    return events;
  }

  // layOutDay(generateTestEvents(10));

  window.layOutDay = layOutDay;
  window.generateTestEvents = generateTestEvents;

}());