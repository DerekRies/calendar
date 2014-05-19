(function () {

  var testEvents = [
    {start: 30, end: 150},
    {start: 540, end: 600},
    {start: 560, end: 620},
    {start: 610, end: 670},
    {start: 900, end: 930},
  ];

  var testEvents4 = [
    {start: 30, end: 150},
    {start: 250, end: 400},
    {start: 270, end: 330},
    {start: 280, end: 390},
    {start: 370, end: 430},
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
      calendarItem.innerHTML = '<h2 class="event-title">Sample Item ' + i  + '</h2><p class="event-location">Sample Location</p>';
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
    data = _.filter(data, function (d) {
      if(d.start > 720 || d.end > 720) {
        return false;
      }
      if(d.start < 0 || d.end < 0){
        return false;
      }
      return true;
    });
    data = _.each(data, function (e) {
      e.width = 1;
      e.left = -1;
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

  function layoutGroup (component, strongCycles, explicitWidth) {
    // a single connected component of the graph of events
    // all events in the component will share the same width
    // width is determined by the size of the
    // var events = g.idsToData(component);
    // console.log(component);
    var groupWidth = .5;
    var maxOffset = 0;
    var offset = -1;
    var isStrong = false;
    var curStrongCycle;
    var events;
    var reset = false;
    var delayedNodesForLayout = [];

    // Sizing
    if(typeof explicitWidth !== 'undefined') {
      groupWidth = 1 / (explicitWidth + 1);
      isStrong = true;
    }
    else if(component.length === 1) {
      groupWidth = 1;
    }
    else if(component.length > 2) {
      // get biggest strong cycle for this component to determine the width
      strongCycles = _.sortBy(strongCycles, function (c) {
        return _.reduce(c, function (sum, num) { return sum + num; });
      });
      strongCycles = _.sortBy(strongCycles, function (c){ return -c.length; });
      // console.log('Sorted Strong Cycles: ', strongCycles);
      for (var i = 0; i < strongCycles.length; i++) {
        if (_.intersection(strongCycles[i], component).length > 0) {
          isStrong = true;
          // console.log('Strong Cycle:');
          curStrongCycle = strongCycles[i];
          // console.log(curStrongCycle);
          groupWidth = 1 / strongCycles[i].length;
          break;
        };
      };
    }

    // Positioning
    maxOffset = (1 / groupWidth) - 1;
    var checked = [];

    function openOffset (v, checkForDisconnects) {
      var adj = g.idsToData(g.adj(v));
      var offsets = _.map(adj, 'left');
      // var adj = g.adj(v);
      // console.log('Vertex: ' + v, offsets, maxOffset);

      if(checkForDisconnects){
        var disconnected = g.isDisconnected(v);
        if(disconnected !== false) {
          var disconnectedNeighbor = g.getById(disconnected);
          var offset = disconnectedNeighbor.left;
          // console.log(v + ' -> Disconnected Neighbor: ' + disconnectedNeighbor.left);
          if(offset !== -1){
            offset = (offset + 1) / (1 / disconnectedNeighbor.width);
            offset = offset <= 0.5 ? maxOffset : 0;
            // console.log(offset);
            return offset;
          }
        }
      }

      if(offsets.length === 1 && offsets[0] === -1) {
        // dont know enough about this node to currently lay it out
        delayedNodesForLayout.push(v);
      }

      // if(offsets.length < 2 && offsets[0] !== 0 && offsets[0] !== -1) {
      //   return offsets[0] - 1;
      // }
      for (var o = 0; o <= maxOffset; o++) {
        if(!_.contains(offsets, o)){
          // and this o is within 1 of another offset
          var distances = _.map(offsets, function (o1) {
            return Math.abs(o1 - o);
          });
          if(_.contains(distances, 1)){
            return o;
          }
        }
      };
      return -1;
    }

    // Need to make sure disconnected nodes don't end up overlapping.
    function positionNode (vertex, offset) {
      checked.push(vertex);
      var node = g.getById(vertex);
      var adj = g.adj(vertex);
      node.left = offset;
      _.each(adj, function (v) {
        if(!_.contains(checked, v)){
          var newOffset = openOffset(v);
          positionNode(v, newOffset);
        }
      });
    }

    function containsDisconnected () {
      for (var i = 0; i < g.disconnections.length; i++) {
        var pair = g.disconnections[i];
        for (var j = 0; j < 2; j++) {
          if(_.contains(component, pair[j])){
            return [ pair[j], pair[Number(!j)] ];
          }
        };
      };
      return false;
    }

    if(!isStrong){
      // if this component contains a node that was disconnected
      // then make sure we start positioning with the node that
      // disconnected, and put it in a spot that wont collide
      // with its previously connected node in another component.
      var disconnected = containsDisconnected();
      if(disconnected !== false){
        console.log('disconnected nodes', disconnected);
        var disconnectedNeighbor = g.getById(disconnected[1]);
        var startOffset = disconnectedNeighbor.left;
        startOffset = (startOffset + 1) / (1 / disconnectedNeighbor.width);
        startOffset = startOffset < 0.5 ? maxOffset : 0;
        // startOffset = Number(!startOffset);
        console.log(startOffset);
        positionNode(disconnected[0], startOffset);
      }
      else {
        positionNode(component[0], 0);
      }
    }

    // Put the strong cycles first so they get laid out from the left
    component = _.sortBy(component, function (e) {
      return !_.contains(curStrongCycle, e) ? 1 : 0;
    });
    events = g.idsToData(component);
    // console.log(component);

    function pos (v) {
      var e = g.getById(v);
      e.width = groupWidth;
      if(isStrong){
        // if(offset < maxOffset) { offset++; }
        // else { offset = openOffset(v); }
        offset = openOffset(v, true);
        if(offset === -1) {
          reset = true;
          console.log('redo group layout with max offset of ' + (maxOffset + 1));
          return;
          // offset = 0;
        }
        e.left = offset;
      }
    }

    _.each(component, pos);
    _.each(delayedNodesForLayout, pos);

    // Nasty hack
    // When the graph processor misses a strong cycle and there
    // are no open offsets for a node in the component, it is known
    // that this unfitting node is a part of the cycle, and we must increment
    // the total number of offsets by 1 to make it fit.
    if(reset) {
      _.each(events, function (e) {
        e.left = -1;
      });
      layoutGroup(component, strongCycles, maxOffset + 1);
    }

  }

  function sectionStronglyConnectedCycles (cycles) {
    // remove the edges connecting strongly connected cycles to the rest of the graph
    for (var i = 0; i < cycles.length; i++) {
      var a = cycles[i];
      // console.log(a);
      _.each(a, function (v) {
        var edges = g.adj(v);
        var edgesToDisconnect = _.difference(edges, a);

        edgesToDisconnect = _.filter(edgesToDisconnect, function (w) {
          // if w is a single vertex with no other connections
          if(g.adj(w).length === 1) {
            // console.log('vertex ' + w + ': is a single vertex');
            return false;
          }
          // if w is a vertex with at least two connections into this cycle
          else if(_.intersection(a, g.adj(w)).length >= 2) {
            // console.log('vertex ' + w + ': has two connections into cycle');
            return false;
          }
          // if w is a member of another strongly connected cycle
          else if(_.some(cycles, function (cycle) {
            return _.contains(cycle, w);
          })) {
            // console.log('vertex ' + w + ': is a member of another strong cycle');
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

  /*
    General Algorithm Overview
    1. Construct a graph where events are vertices and collisions are edges
    2. Find all the strong cycles in the graph. (cycles where every vertex shares
    an edge with every other vertex)
    3. Disconnect every strong cycle from their components under certain restrictions
    (shown in the sectionStronglyConnectedCycles method). The disconnection is done as a
    way of making sure that an events visual representation can be expanded where possible.
    4. Now find all the new connected components
    5. For every connected component set the group width to be the size of the strong cycle
    and then position each node where there is an open spot.
  */
  function layOutDay (events) {
    events = preprocess(events);
    g = makeGraph(events);
    console.log(g);
    window.g = g;


    var cc = new Graph.GraphProcessor(g);
    // console.log(cc);
    var strongCycles = cc.getLargestStrongCycles();
    // console.log(strongCycles);
    sectionStronglyConnectedCycles(strongCycles);


    cc.update(g);
    var components = cc.components();

    // strong cycle components need to be laid out first
    components = _.sortBy(components, function (comp) {
      return -_.max(_.map(strongCycles, function (cycle) {
        return _.intersection(cycle, comp).length;
      }));
    });
    _.each(components, function (component) {
      layoutGroup(component, strongCycles);
    });
    renderGroup(events);
  }


  renderCalendarGutter();
  layOutDay(testEvents);
  // layOutDay(testEvents2);
  // layOutDay(testEvents3);
  // layOutDay(testEvents5);



  // layOutDay(generateTestEvents(10));

  window.layOutDay = layOutDay;

}());