import { MinHeap } from "../data structures/minheap";
import { manhattan, euclidian } from "../heuristics";

export function aStar(grid, start, finish, heuristic) {
  const visitedNodesInOrder = [start];
  start.distance = 0;
  start.heuristicVal = getHeuristicVal(start, finish, heuristic);
  start.directionChange = 0;

  const unvisitedNodesHeap = getNodeHeap(grid, finish, heuristic);
  updateNeighbors(start, finish, start, grid, heuristic);
  unvisitedNodesHeap.heapify();
  while (unvisitedNodesHeap.length > 0) {
    const closestNode = unvisitedNodesHeap.extractMin();
    if (closestNode.isWall) {
      continue;
    }
    if (closestNode.distance === Infinity) {
      return visitedNodesInOrder;
    }
    if (closestNode === finish) {
      visitedNodesInOrder.push(closestNode);
      console.log(grid);
      return visitedNodesInOrder;
    }
    visitedNodesInOrder.push(closestNode);
    updateNeighbors(start, finish, closestNode, grid, heuristic);
    unvisitedNodesHeap.heapify();
  }
}

function getHeuristicVal(node, finish, heuristic) {
  if (heuristic === "manhattan") {
    return node.distance + manhattan(node, finish);
  } else if (heuristic === "euclidean") {
    return node.distance + euclidian(node, finish);
  }
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

function updateNeighbors(start, finish, node, grid, heuristic) {
  const neighbors = getNeighbors(node, grid);
  for (const neighbor of neighbors) {
    if (neighbor !== start) {
      if (neighbor.distance === Infinity) {
        directionChangeCheck(node, neighbor);
        neighbor.previousNode = node;
        neighbor.distance = node.distance + neighbor.weight;
        neighbor.heuristicVal = getHeuristicVal(neighbor, finish, heuristic);
      } else {
        const tempNeighborDistance = neighbor.distance;
        const tempNeighborDirection = neighbor.direction;
        const tempNeighborTieBreak = neighbor.tieBreak;

        neighbor.distance = node.distance + neighbor.weight;
        directionChangeCheck(node, neighbor);
        if (
          neighbor.heuristicVal >
            getHeuristicVal(neighbor, finish, heuristic) ||
          (neighbor.heuristicVal ===
            getHeuristicVal(neighbor, finish, heuristic) &&
            tempNeighborTieBreak > neighbor.tieBreak)
        ) {
          neighbor.previousNode = node;
          neighbor.heuristicVal = getHeuristicVal(neighbor, finish, heuristic);
        } else if (
          neighbor.heuristicVal ===
            getHeuristicVal(neighbor, finish, heuristic) &&
          tempNeighborTieBreak === neighbor.tieBreak
        ) {
          const previousDist = lineDistance(neighbor.previousNode);
          const nodeDist = lineDistance(node);
          if (nodeDist > previousDist) {
            neighbor.previousNode = node;
            neighbor.heuristicVal = getHeuristicVal(
              neighbor,
              finish,
              heuristic
            );
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

function getNodeHeap(grid, finish, heuristic) {
  var nodeHeap = new MinHeap(finish, heuristic);
  for (const row of grid) {
    for (const node of row) {
      nodeHeap.insert(node);
    }
  }
  nodeHeap.heapify();
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
