export function depthFirst(grid, start, finish) {
  const visitedNodesInOrder = [start];
  start.isVisited = true;
  start.distance = 0;
  var nodesToVisit = getNeighbors(start, grid).reverse();
  while (!!nodesToVisit.length) {
    const node = nodesToVisit.shift();
    visitedNodesInOrder.push(node);
    if (node === finish) {
      start.isVisited = false;
      return visitedNodesInOrder;
    }
    node.isVisited = true;
    var nodesToQueue = getNeighbors(node, grid);
    for (const neighbor of nodesToQueue) {
      nodesToVisit.unshift(neighbor);
    }
  }
  return visitedNodesInOrder;
}

function getNeighbors(node, grid) {
  const { col, row } = node;
  var neighbor;
  const neighbors = [];
  if (row > 0) {
    neighbor = updateNeighbor(node, grid[row - 1][col]);
    if (neighbor !== null) {
      neighbors.unshift(neighbor);
    }
  }
  if (col < grid[0].length - 1) {
    neighbor = updateNeighbor(node, grid[row][col + 1]);
    if (neighbor !== null) {
      neighbors.unshift(neighbor);
    }
  }

  if (row < grid.length - 1) {
    neighbor = updateNeighbor(node, grid[row + 1][col]);
    if (neighbor !== null) {
      neighbors.unshift(neighbor);
    }
  }
  if (col > 0) {
    neighbor = updateNeighbor(node, grid[row][col - 1]);
    if (neighbor !== null) {
      neighbors.unshift(neighbor);
    }
  }
  return neighbors;
}

function updateNeighbor(node, neighbor) {
  if (!neighbor.isWall && !neighbor.isVisited) {
    neighbor.distance = node.distance + neighbor.weight;
    neighbor.previousNode = node;
    return neighbor;
  } else {
    return null;
  }
}

export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
