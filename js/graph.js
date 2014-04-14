var Node = function (data) {
  this._id = 0;
  this.data = data;
  this.neighbors = [];
};

Node.prototype.sharesEdgeWith = function(node) {
  return this.neighbors.indexOf(node);
};

Node.prototype.isCollidingWith = function(nodeB) {
  if(nodeB.data.start > this.data.end || nodeB.data.end < this.data.start ){
    return false;
  }
  return true;
};

Node.prototype.addNeighbor = function(node) {
  if(this.neighbors.indexOf(node) === -1){
    this.neighbors.push(node);
  }
};

var Graph = function () {
  this.nodes = [];
  this.count = 0;
};

Graph.prototype.updateEdgesForNode = function(node) {
  for(var i = 0; i < this.nodes.length ; i++) {
    if(node.isCollidingWith(this.nodes[i])){
      this.addEdge(node, this.nodes[i]);
    }
  }
};

Graph.prototype.addEdge = function(nodeA, nodeB) {
  nodeA.addNeighbor(nodeB);
  nodeB.addNeighbor(nodeA);
};

Graph.prototype.addNode = function(item) {
  // body...
  var node = new Node(item);
  node._id = this.count++;
  this.updateEdgesForNode(node);
  this.nodes.push(node);
};