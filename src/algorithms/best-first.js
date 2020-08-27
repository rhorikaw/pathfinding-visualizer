import { MinHeap } from "../data structures/minheap";
import { manhattan, euclidian } from "../heuristics";

export function greedyBFS(grid, start, finish, heuristic) {
  const visitedNodesInOrder = [start];
  start.distance = 0;
  start.heuristicVal = getHeuristicVal(start, finish, heuristic);

  const unvisitedNodesHeap = getNodeHeap(grid, finish, heuristic);
  updateNeighbors(start, finish, start, grid, heuristic);
  unvisitedNodesHeap.heapify();
  while (unvisitedNodesHeap.length > 0) {
    const closestNode = unvisitedNodesHeap.extractMin();
    if (closestNode.heuristicVal === Infinity) {
      return visitedNodesInOrder;
    }
    if (closestNode.isWall) {
      continue;
    }
    if (closestNode === finish) {
      visitedNodesInOrder.push(closestNode);
      return visitedNodesInOrder;
    }
    visitedNodesInOrder.push(closestNode);
    updateNeighbors(start, finish, closestNode, grid, heuristic);
    unvisitedNodesHeap.heapify();
  }
}

function getHeuristicVal(node, finish, heuristic) {
  if (heuristic === "manhattan") {
    return manhattan(node, finish);
  } else if (heuristic === "euclidean") {
    return euclidian(node, finish);
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
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

function updateNeighbors(start, finish, node, grid, heuristic) {
  const neighbors = getNeighbors(node, grid);
  for (const neighbor of neighbors) {
    if (neighbor !== start && neighbor.previousNode === null) {
      neighbor.previousNode = node;
      neighbor.distance = node.distance + neighbor.weight;
      neighbor.heuristicVal = getHeuristicVal(neighbor, finish, heuristic);
    }
  }
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
