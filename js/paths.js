(function () {


  function makeArray (size, value) {
    var arr = [];
    for(var i = 0; i < size ; i++) {
      arr.push(value);
    }
    return arr;
  }


  var GraphProcessor = function (graph) {
    // Handles Connectivity, Cycles, and strongly connected cycles
    this.update(graph, true);
  };

  GraphProcessor.prototype.update = function(graph, cycles) {
    // body...
    var g = graph;
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

    function contains (haystack, needles) {
      return _.every(needles, function (needle) {
        return _.contains(haystack, needle);
      });
    }
    var selfcycles = this.cycles;

    var combine = function(a, min) {
        var fn = function(n, src, got, all) {
            if (n == 0) {
                if (got.length > 0) {
                    all[all.length] = got;
                }
                return;
            }
            for (var j = 0; j < src.length; j++) {
                fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
            }
            return;
        }
        var all = [];
        for (var i = min; i < a.length; i++) {
            fn(i, a, [], all);
        }
        all.push(a);
        return all;
    }

    function subcycles (cycle) {
      var combination;
      var adjacents = [];
      for (var j = 0; j < cycle.length; j++) {
        adjacents[j] = g.adj(cycle[j]).concat(cycle[j]);
      };

      _.each(combine(cycle, 4), function (c) {
        var count = 0;
        for (var i = 0; i < cycle.length; i++) {
          if(contains(adjacents[i], c)) {
            count++;
          }
        };
        // console.log(c, count);
        if (count >= c.length) {
          selfcycles.push(c);
        };
      });
    }

    // Hack Solution
    // Finds some of the smaller subcycles that get missed by the dfs
    // and may contain strong cycles in later steps of the algorithm
    if(typeof cycles !== 'undefined' && graph.vertices.length < 50){
      for (var i = this.cycles.length - 1; i >= 0; i--) {
          if(this.cycles[i].length > 4 && this.cycles[i].length < 7) {
            subcycles(this.cycles[i]);
          }
      };
    }
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
    // console.log('normal cycles');
    // console.log(this.cycles);
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
    // console.log('first strong cycles');
    // console.log(strongCycles);
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


  window.Graph.GraphProcessor = GraphProcessor;
}());