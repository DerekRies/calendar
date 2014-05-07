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

  var testEvents3 = [
    {start: 30, end: 150},
    {start: 170, end: 220},
    {start: 200, end: 310},
    {start: 240, end: 290},
    {start: 305, end: 360},
    {start: 325, end: 410},
    {start: 400, end: 460},
    {start: 420, end: 490},
    {start: 440, end: 510},
    {start: 450, end: 520},
    {start: 470, end: 535},
    {start: 550, end: 640},
    {start: 650, end: 700},
    {start: 670, end: 720},
  ];

  var canvas = document.getElementById('calendar-canvas'),
      gutter = document.getElementById('calendar-gutter'),
      minutesToPixelsRatio = 1,
      g;

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
      var width = events[i].width * 600;
      calendarItem.style.width = width + 'px';
      calendarItem.style.left = events[i].left * width + 'px';
      var dif = events[i].end - events[i].start;
      // console.log(dif);
      calendarItem.style.height = (dif * minutesToPixelsRatio) + 'px';
      fragment.appendChild(calendarItem);
      // console.log(events[i]);
    }
    canvas.appendChild(fragment);
  }


  function preprocess (events) {
    var data = _.sortBy(events, function (e) {
      return e.start;
    });
    data = _.each(data, function (e) {
      e.width = 1;
      e.left = 0;
    });
    return data;
  }

  function collides (a, b) {
    if(b.start > a.end || b.end < a.start) {
      return false;
    }
    return true;
  }

  function makeGraph (events) {
    var graph = new Graph(events);
    // collision detection add edges
    for(var i = 0; i < events.length - 1 ; i++) {
      for (var j = i + 1; j < events.length; j++) {
        if(collides(events[i], events[j])) {
          graph.addEdge(i, j);
        }
      };
    }
    return graph;
  }

  function layoutGroup (component, strongCycles) {
    // a single connected component of the graph of events
    // all events in the component will share the same width
    // width is determined by the size of the
    var events = g.idsToData(component);
    console.log(events, component);
    var groupWidth = .5;
    var maxOffset = 0;
    var offset = 0;
    if(events.length === 1) {
      groupWidth = 1;
    }
    else if(events.length > 2) {
      // get biggest strong cycle for this component
      // because that will determine the width
    }

    maxOffset = (1 / groupWidth) - 1;
    _.each(events, function (e) {
      e.width = groupWidth;
      e.left = offset;
      if(offset < maxOffset) {
        offset++;
      }
      else {
        offset = 0;
      }
    });
  }

  function sectionStronglyConnectedCycles (cycles) {
    // remove the edges connecting strongly connected cycles
    // to the rest of the graph unless:
    // 1. Its connected to a single node
    // 2. It's connected to another strongly connected cycle
    for (var i = 0; i < cycles.length; i++) {
      var a = cycles[i];
      console.log(a);
      _.each(a, function (v) {
        var edges = g.adj(v);
        var edgesToDisconnect = _.difference(edges, a);
        // console.log(v, edges);
        // console.log('difference', edgesToDisconnect);

        edgesToDisconnect = _.filter(edgesToDisconnect, function (w) {
          // if w is a single vertex with no other connections
          if(g.adj(w).length === 1) {
            return false;
          }
          // if w is a member of another strongly connected cycle
          else if(_.some(cycles, function (cycle) {
            return _.contains(cycle, w);
          })) {
            return false;
          }
          return true;
        });

        if(edgesToDisconnect.length) {
          _.each(edgesToDisconnect, function (w){
            g.removeEdge(v, w);
          });
        }
      });


    };
  }

  function layOutDay (events) {
    events = preprocess(events);
    g = makeGraph(events);
    console.log(g);
    // window.g = g;


    var cc = new Graph.GraphProcessor(g);
    console.log(cc);
    var strongCycles = cc.getLargestStrongCycles();
    sectionStronglyConnectedCycles(strongCycles);


    cc.update(g);
    var components = cc.components();
    _.each(components, function (component) {
      layoutGroup(component, strongCycles);
    });
    renderGroup(events);
  }


  renderCalendarGutter();
  // layOutDay(testEvents);
  // layOutDay(testEvents2);
  layOutDay(testEvents3);

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