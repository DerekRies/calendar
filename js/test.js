function layOutDayFromLS (key) {
  var events = JSON.parse(localStorage.getItem(key));
  _.each(events, function (e) {
    delete e.width;
    delete e.left;
  });
  layOutDay(events);
}

function saveCurrentEvents (key) {
  localStorage.setItem(key, JSON.stringify(g.vertices));
}

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

// layOutDayFromLS('cluster');