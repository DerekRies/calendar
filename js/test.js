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