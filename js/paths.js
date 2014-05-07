(function () {


  function makeArray (size, value) {
    var arr = [];
    for(var i = 0; i < size ; i++) {
      arr.push(value);
    }
    return arr;
  }

  var Paths = function () {}
  Paths.prototype.hasPathTo = function(v) {
    return this.marked[v];
  };
  Paths.prototype.pathTo = function(v) {
    if(!this.hasPathTo(v)) { return null; }
    var path = [];
    for(var i = v; i !== this.s ; i = this.edgeTo[i]) {
      path.push(i);
    }
    path.push(this.s);
    return path;
  };



  var dfsPaths = function (graph, s) {
    this.graph = graph;
    this.s = s;
    this.marked = makeArray(graph.verts(), false);
    this.edgeTo = makeArray(graph.verts(), undefined);
    this.dfs(s)
  };

  dfsPaths.prototype = new Paths();
  dfsPaths.prototype.constructor = dfsPaths;

  dfsPaths.prototype.dfs = function(v) {
    // body...
    var adjs = this.graph.adj(v);
    this.marked[v] = true;
    _.each(adjs, function (w) {
      if(!this.marked[w]){
        this.dfs(w);
        this.edgeTo[w] = v;
      }
    }, this);
  };

  var bfsPaths = function (graph, s) {
    this.graph = graph;
    this.marked = makeArray(graph.verts(), false);
    this.edgeTo = makeArray(graph.verts(), undefined);
    this.s = s;
    this.bfs(s);
  };

  bfsPaths.prototype = new Paths();
  bfsPaths.prototype.constructor = bfsPaths;

  bfsPaths.prototype.bfs = function(s) {
    var q = [];
    q.unshift(s);
    this.marked[s] = true;
    while(q.length !== 0) {
      var v = q.shift();
      _.each(this.graph.adj(v), function (w) {
        if(!this.marked[w]){
          q.unshift(w);
          this.marked[w] = true;
          this.edgeTo[w] = v;
        }
      }, this);
    }
  };


  var GraphProcessor = function (graph) {
    // Handles Connectivity, Cycles, and strongly connected cycles
    this.update(graph);
  };

  GraphProcessor.prototype.update = function(graph) {
    // body...
    this.marked = makeArray(graph.verts(), false);
    this.id = makeArray(graph.verts(), undefined);
    this.edgeTo = makeArray(graph.verts(), undefined);
    this.count = 0;
    this.graph = graph;
    this.cycles = [];

    for (var v = 0; v < graph.verts(); v++) {
      if(!this.marked[v]) {
        this._dfs(this.graph, v);
        this.count++;
      }
    };

    this.cycles = _.filter(this.cycles, function (cycle) {
      return cycle.length > 1;
    });
  };

  GraphProcessor.prototype._dfs = function(g, v) {
    this.marked[v] = true;
    this.id[v] = this.count;
    _.each(g.adj(v), function (w) {
      if(!this.marked[w]){
        this._dfs(g, w);
        this.edgeTo[w] = v;
      }
      else {
        this.cycles.push(this.makeCycle(w));
      }
    }, this);
  };

  GraphProcessor.prototype.isStrongCycle = function(cycle) {
    // Every vertex in the cycle shares an edge with every
    // other vertex in the cycle
    var g = this.graph;
    return _.every(cycle, function (v) {
      var edges = _.union(g.adj(v), [v]);
      var edgesAndCycle = _.union(edges, cycle);
      // If the unioned edgesAndCycles length is longer than the edges
      // list, then that means that the cycle contains a vertex not found
      // in the edges list, and the cycle is not strongly connected
      return edges.length === edgesAndCycle.length;
    });
  };

  GraphProcessor.prototype.getStrongCycles = function() {
    var strongCycles = [];
    _.each(this.cycles, function (cycle) {
      if(this.isStrongCycle(cycle)){
        strongCycles.push(cycle);
      }
    }, this);

    return strongCycles;
  };

  GraphProcessor.prototype.getLargestStrongCycles = function() {
    // should only return the largest possible cycles
    // (no sub-cycles, cycles that are subsets of other cycles)
    function containedWithin (cycle, cycles, ignoreIndex) {
      for (var x = 0; x < cycles.length; x++) {
        if(x !== ignoreIndex && cycle.length < cycles[x].length) {
          if(cycles[x].length === _.union(cycles[x], cycle).length) {
            return true;
          }
        }
      };
      return false;
    }
    var strongCycles = this.getStrongCycles();
    var cs = [];
    for (var i = 0; i < strongCycles.length; i++) {
      var a = strongCycles[i];
      // console.log(a, containedWithin(a, strongCycles, i));
      if(!containedWithin(a, strongCycles, i)) {
        cs.push(a);
      }
    };
    return cs;
  };

  GraphProcessor.prototype.makeCycle = function(w) {
    var cycle = [];
    for(var v = w ; v !== undefined ; v = this.edgeTo[v]) {
      cycle.push(v);
    }
    return cycle;
  };

  GraphProcessor.prototype.connected = function(v, w) {
    // Are the v and w vertices connected
    return this.id[v] === this.id[w];
  };

  GraphProcessor.prototype.components = function() {
    var c = this.count;
    var components = Array.apply(null, Array(c)).map(function(){return [];});
    for(var v = 0 ; v < this.id.length ; v++) {
      components[this.id[v]].push(v);
    }
    return components;
  };


  window.Graph.BFSPaths = bfsPaths;
  window.Graph.DFSPaths = dfsPaths;
  window.Graph.GraphProcessor = GraphProcessor;
}());