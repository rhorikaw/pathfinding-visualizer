export function bidirectionalBFS(grid, start, finish) {
  const nodes = getNodeList(grid);
  const visitedStartNodes = [start];
  const visitedFinishNodes = [finish];

  start.distance = 0;
  finish.distance = 0;

  var neighborsFromStart, neighborsFromFinish, pathFoundStart, pathFoundFinish;

  [neighborsFromStart, pathFoundStart] = updateNeighbors(
    start,
    start,
    grid,
    visitedStartNodes,
    visitedFinishNodes,
    false
  );
  [neighborsFromFinish, pathFoundFinish] = updateNeighbors(
    finish,
    finish,
    grid,
    visitedFinishNodes,
    visitedStartNodes,
    false
  );

  while (nodes.length > 0) {
    var nextStartNeighbors = [];
    var nextFinishNeighbors = [];
    var neighborListLength = 0;
    var updateData, pathFound;

    if (neighborsFromStart.length > neighborsFromFinish.length) {
      neighborListLength = neighborsFromStart.length;
    } else {
      neighborListLength = neighborsFromFinish.length;
    }
    sortNodes(neighborsFromStart);
    sortNodes(neighborsFromFinish);
    for (let i = 0; i < neighborListLength; i++) {
      if (neighborsFromStart.length > i) {
        const neighbor = neighborsFromStart[i];
        if (!neighbor.isWall) {
          if (
            visitedFinishNodes.includes(neighbor) &&
            neighbor.mergePoint !== null
          ) {
            return {
              start: visitedStartNodes,
              finish: visitedFinishNodes,
              shortestPath: getShortestPath(neighbor, true),
            };
          } else {
            visitedStartNodes.push(neighbor);
            [updateData, pathFound] = updateNeighbors(
              start,
              neighbor,
              grid,
              visitedStartNodes,
              visitedFinishNodes,
              pathFoundStart
            );
            nextStartNeighbors = [...nextStartNeighbors, ...updateData];
            if (!pathFoundStart) {
              pathFoundStart = pathFound;
            }
          }
        }
      }
      if (neighborsFromFinish.length > i) {
        const neighbor = neighborsFromFinish[i];
        if (!neighbor.isWall) {
          if (
            visitedStartNodes.includes(neighbor) &&
            neighbor.mergePoint !== null
          ) {
            return {
              start: visitedStartNodes,
              finish: visitedFinishNodes,
              shortestPath: getShortestPath(neighbor, false),
            };
          } else {
            visitedFinishNodes.push(neighbor);
            [updateData, pathFound] = updateNeighbors(
              finish,
              neighbor,
              grid,
              visitedFinishNodes,
              visitedStartNodes,
              pathFoundFinish
            );
            nextFinishNeighbors = [...nextFinishNeighbors, ...updateData];
            if (!pathFoundFinish) {
              pathFoundFinish = pathFound;
            }
          }
        }
      }
    }
    if (nextStartNeighbors.every((val) => neighborsFromStart.includes(val))) {
      return {
        start: visitedStartNodes,
        finish: visitedFinishNodes,
        shortestPath: [],
      };
    } else {
      neighborsFromStart = removeDuplicates(nextStartNeighbors);
    }
    if (nextFinishNeighbors.every((val) => neighborsFromFinish.includes(val))) {
      return {
        start: visitedStartNodes,
        finish: visitedFinishNodes,
        shortestPath: [],
      };
    } else {
      neighborsFromFinish = removeDuplicates(nextFinishNeighbors);
    }
  }
}

//Implement as min-heap instead of array?
function sortNodes(unvisitedNodes) {
  unvisitedNodes.sort((a, b) => a.row - b.row);
}

function removeDuplicates(list) {
  return list.filter((value, index) => list.indexOf(value) === index);
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

function updateNeighbors(
  origin,
  node,
  grid,
  visitedStartNodes,
  visitedFinishNodes,
  pathIsFound
) {
  const neighbors = getNeighbors(node, grid).filter(
    (neighbor) => !visitedStartNodes.includes(neighbor)
  );
  for (const neighbor of neighbors) {
    if (neighbor.previousNode === null && neighbor !== origin) {
      neighbor.distance = node.distance + neighbor.weight;
      neighbor.previousNode = node;
    } else if (
      neighbor !== origin &&
      neighbor.previousNode !== null &&
      visitedFinishNodes.includes(neighbor) &&
      neighbor.mergePoint === null &&
      node.previousNode !== neighbor &&
      pathIsFound === false
    ) {
      neighbor.distance += node.distance + 1;
      neighbor.mergePoint = node;
      pathIsFound = true;
    }
  }
  return [neighbors, pathIsFound];
}

function getNodeList(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function getShortestPath(node, isFromStart) {
  const nodesInShortestPathOrder = [node];
  if (isFromStart) {
    let toStart = node.mergePoint;
    while (toStart !== null) {
      nodesInShortestPathOrder.unshift(toStart);
      toStart = toStart.previousNode;
    }
    let toFinish = node.previousNode;
    while (toFinish !== null) {
      nodesInShortestPathOrder.push(toFinish);
      toFinish = toFinish.previousNode;
    }
  } else {
    let toStart = node.previousNode;
    while (toStart !== null) {
      nodesInShortestPathOrder.unshift(toStart);
      toStart = toStart.previousNode;
    }
    let toFinish = node.mergePoint;
    while (toFinish !== null) {
      nodesInShortestPathOrder.push(toFinish);
      toFinish = toFinish.previousNode;
    }
  }
  nodesInShortestPathOrder[nodesInShortestPathOrder.length - 1].distance =
    node.distance;
  return nodesInShortestPathOrder;
}
