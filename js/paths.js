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


  var CC = function (graph) {
    this.marked = makeArray(graph.verts(), false);
    this.id = makeArray(graph.verts(), undefined);
    this.count = 0;
    this.graph = graph;

    for (var v = 0; v < graph.verts(); v++) {
      if(!this.marked[v]) {
        this._dfs(this.graph, v);
        this.count++;
      }
    };
  };

  CC.prototype._dfs = function(g, v) {
    this.marked[v] = true;
    this.id[v] = this.count;
    _.each(g.adj(v), function (w) {
      if(!this.marked[w]){
        this._dfs(g, w);
      }
    }, this);
  };

  CC.prototype.connected = function(v, w) {
    // Are the v and w vertices connected
    return this.id[v] === this.id[w];
    return false;
  };

  CC.prototype.components = function() {
    var c = this.count;
    var components = Array.apply(null, Array(c)).map(function(){return [];});
    for(var v = 0 ; v < this.id.length ; v++) {
      components[this.id[v]].push(v);
    }
    return components;
  };


  window.Graph.BFSPaths = bfsPaths;
  window.Graph.DFSPaths = dfsPaths;
  window.Graph.ConnectedComponents = CC;
}());