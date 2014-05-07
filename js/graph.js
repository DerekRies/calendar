(function () {

  var Graph = function (data) {
    // Takes an array, data, that will be the list of vertices
    // in the graph
    this.vertices = data;
    this.numEdges = 0;
    this.adjacencyList = Array.apply(null, Array(data.length)).map(function () {return []; });
  };

  Graph.prototype.addEdge = function(v, w) {
    // add an edge v-w
    this.adjacencyList[v].push(w);
    this.adjacencyList[w].push(v);
    this.numEdges++;
  };

  Graph.prototype.removeEdge = function(v, w) {
    // body...
  };

  Graph.prototype.adj = function(v) {
    // returns all vertices adjacent to v
    return this.adjacencyList[v];
  };

  Graph.prototype.adjData = function(v) {
    return _.map(this.adjacencyList[v], function (i) {
      return this.vertices[i];
    }, this);
  };

  Graph.prototype.idsToData = function(ids) {
    return _.map(ids, function (id) {
      return this.vertices[id];
    }, this);
  };

  Graph.prototype.getById = function(v) {
    return this.vertices[v];
  };

  Graph.prototype.verts = function() {
    // return the number of vertices
    return this.vertices.length;
  };

  Graph.prototype.edges = function() {
    // return the number of edges
    return this.numEdges;
  };

  Graph.prototype._vertexPairs = function() {
    if(this._vertexPairsCache) {
      console.log('cache hit');
      return this._vertexPairsCache;
    }
    var pairs = [];
    for (var i = 0; i < this.vertices.length; i++) {
      var adjacents = this.adj(i);
      for(var j = 0; j < adjacents.length; j++) {
        pairs.push([i, adjacents[j]]);
      }
    };
    pairs = _.map(pairs, function (pair) {
      return _.sortBy(pair).join('-');
    });
    pairs = _.uniq(pairs);
    pairs = _.map(pairs, function (pair) {
      return _.map(pair.split('-'), Number);
    })
    this._vertexPairsCache = pairs;
    return pairs;
  };

  Graph.prototype._log = function() {
    // logs out all the vertex pairs
    var pairs = this._vertexPairs();
    _.each(pairs, function (pair) {
      console.log(pair[0] + '---' + pair[1]);
    });
  };

  window.Graph = Graph;

}());