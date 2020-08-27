import { MinHeap } from "../data structures/minheap";

export function breadthFirst(grid, start, finish) {
  const visitedNodesInOrder = [start];
  start.distance = 0;

  const unvisitedNodesHeap = getNodeHeap(grid);

  while (unvisitedNodesHeap.length > 0) {
    const closestNodes = [];
    while (unvisitedNodesHeap.getMin().distance !== Infinity) {
      closestNodes.push(unvisitedNodesHeap.extractMin());
    }
    sortNodes(closestNodes);
    if (closestNodes.length === 0) {
      return visitedNodesInOrder;
    }
    for (const node of closestNodes) {
      if (node.isWall) {
        continue;
      }
      if (node === finish) {
        visitedNodesInOrder.push(node);
        return visitedNodesInOrder;
      }
      visitedNodesInOrder.push(node);
      updateNeighbors(start, node, grid);
      unvisitedNodesHeap.heapify();
    }
    unvisitedNodesHeap.heapify();
  }
}

//Implement as min-heap instead of array?
function sortNodes(unvisitedNodes) {
  unvisitedNodes.sort((a, b) => a.row - b.row);
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) {
    neighbors.push(grid[row - 1][col]);
  }
  if (row < grid.length - 1) {
    neighbors.push(grid[row + 1][col]);
  }
  if (col > 0) {
    neighbors.push(grid[row][col - 1]);
  }
  if (col < grid[0].length - 1) {
    neighbors.push(grid[row][col + 1]);
  }
  return neighbors;
}

function updateNeighbors(start, node, grid) {
  const neighbors = getNeighbors(node, grid);
  for (const neighbor of neighbors) {
    if (neighbor.distance === Infinity) {
      neighbor.distance = node.distance + 1;
      directionChangeCheck(node, neighbor);
      if (neighbor !== start) {
        neighbor.previousNode = node;
      }
    } else {
      const tempNeighborDistance = neighbor.distance;
      const tempNeighborDirection = neighbor.direction;
      const tempNeighborTieBreak = neighbor.tieBreak;

      neighbor.distance = node.distance + neighbor.weight;
      directionChangeCheck(node, neighbor);

      if (neighbor !== start) {
        if (
          neighbor.distance + neighbor.tieBreak <
          tempNeighborDistance + tempNeighborTieBreak
        ) {
          neighbor.previousNode = node;
        } else if (
          neighbor.distance + neighbor.tieBreak ===
          tempNeighborDistance + tempNeighborTieBreak
        ) {
          const previousDist = lineDistance(neighbor.previousNode);
          const nodeDist = lineDistance(node);
          if (nodeDist > previousDist) {
            neighbor.previousNode = node;
          }
        } else {
          neighbor.distance = tempNeighborDistance;
          neighbor.direction = tempNeighborDirection;
          neighbor.tieBreak = tempNeighborTieBreak;
        }
      }
    }
  }
}

function directionChangeCheck(node, neighbor) {
  if (node.row === neighbor.row) {
    if (node.col > neighbor.col) {
      neighbor.direction = "left";
    } else {
      neighbor.direction = "right";
    }
  }
  if (node.col === neighbor.col) {
    if (node.row > neighbor.row) {
      neighbor.direction = "up";
    } else {
      neighbor.direction = "down";
    }
  }
  if (node.direction !== null) {
    if (node.direction !== neighbor.direction) {
      neighbor.tieBreak = node.tieBreak + 1;
    } else {
      neighbor.tieBreak = node.tieBreak;
    }
  }
}

function lineDistance(node) {
  const direction = node.direction;
  var distance = 0;
  while (node !== null) {
    if (node.direction === direction) {
      distance++;
      node = node.previousNode;
    } else {
      return distance;
    }
  }
  return distance;
}

function getNodeHeap(grid) {
  var nodeHeap = new MinHeap();
  for (const row of grid) {
    for (const node of row) {
      nodeHeap.insert(node);
    }
  }
  return nodeHeap;
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
