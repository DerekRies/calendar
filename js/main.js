(function () {

  var testEvents = [
    {start: 30, end: 150},
    {start: 540, end: 600},
    {start: 560, end: 620},
    {start: 610, end: 670},
  ];

  var canvas = document.getElementById('calendar-canvas'),
      gutter = document.getElementById('calendar-gutter'),
      minutesToPixelsRatio = 1.1;

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
      var dif = events[i].end - events[i].start;
      // console.log(dif);
      calendarItem.style.height = (dif * minutesToPixelsRatio) + 4 + 'px';
      fragment.appendChild(calendarItem);
      // console.log(events[i]);
    }
    canvas.appendChild(fragment);
  }

  function layOutDay(events) {
    /*
    Need to go through each event and check for collision groups.
    Collision groups will share the same width.
     */

    /*
    Collision Group
    [{
      width: x,
      height: x,
      left: x
    }]

    Basic algorithm:
      For every event in the collection of events:
        check against every other event, if colliding:
          add to a collision group
     */

    //TODO: Only check collisions once
    //      e.g. A<->B = B<->A

    for(var i =0 ; i < events.length ; i++) {
      for (var j = events.length - 1; j >= 0; j--) {
        if(events[i] !== events[j]) {
          if(isCollision(events[i], events[j])){
            console.log('collision between ' + i + ' ' + j);
          }
        }
      };
      console.log(events[i]);
    }
    renderGroup(events);
  }

  function isCollision (eventA, eventB) {
    if(eventB.start > eventA.end || eventB.end < eventA.start ){
      return false;
    }
    return true;
  }

  function renderCollisionGroup (events) {

  }


  renderCalendarGutter();
  layOutDay(testEvents);

  window.layOutDay = layOutDay;

}());