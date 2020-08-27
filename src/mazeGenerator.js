export function generateSimpleMaze(grid) {
  var prevGapCols = [];
  for (let row = 0; row < grid.length; row++) {
    const gapCols = [];
    const wallCols = [];
    //Assign Random Gaps in the Wall Columns
    if (row % 2 === 0) {
      for (var i = 0; i < 4; i++) {
        gapCols.push(Math.floor(Math.random() * 10 + i * 10));
      }
    } else {
      for (var i = 0; i < 2; i++) {
        var randomWallCol = Math.floor(Math.random() * 20 + i * 20);
        while (prevGapCols.includes(randomWallCol)) {
          randomWallCol = Math.floor(Math.random() * 20 + i * 20);
        }
        wallCols.push(randomWallCol);
      }
    }

    for (let col = 0; col < grid[0].length; col++) {
      grid[row][col].isVisited = false;
      if (grid[row][col].isWall === true) {
        grid[row][col].isWall = false;
      }
      if (!grid[row][col].isStart && !grid[row][col].isFinish) {
        if (
          row === 0 ||
          col === 0 ||
          row === grid.length - 1 ||
          col === grid[0].length - 1
        ) {
          grid[row][col].isWall = true;
        } else if (
          (!gapCols.includes(col) && row % 2 === 0) ||
          (row % 2 !== 0 && wallCols.includes(col))
        ) {
          grid[row][col].isWall = true;
        }
      }
    }
    prevGapCols = gapCols;
  }
  return grid;
}

export function generateRecursiveMaze(grid) {
  for (var row = 0; row < grid.length; row++) {
    for (var col = 0; col < grid[0].length; col++) {
      grid[row][col].isVisited = false;
      if (grid[row][col].isWall) {
        grid[row][col].isWall = false;
      }
      if (
        row === 0 ||
        row === grid.length - 1 ||
        col === 0 ||
        col === grid[0].length - 1
      ) {
        grid[row][col].isWall = true;
      }
    }
  }
  recursiveMazeHelper(grid, 1, 1, grid.length - 2, grid[0].length - 2, []);
  return grid;
}

function recursiveMazeHelper(
  grid,
  minRowNum,
  minColNum,
  maxRowNum,
  maxColNum,
  prevGapNeighbors
) {
  if (minRowNum >= maxRowNum || minColNum >= maxColNum) {
    return;
  }

  if (maxColNum - minColNum >= maxRowNum - minRowNum) {
    //horizontal
    const possibleWallIndices = [];
    const possibleGapIndices = [];
    var gapNeighbors = [];
    for (let i = minColNum + 1; i < maxColNum; i++) {
      if (checkColWall(grid, i, minRowNum, maxRowNum, prevGapNeighbors)) {
        possibleWallIndices.push(i);
      }
    }
    for (let j = minRowNum; j <= maxRowNum; j++) {
      possibleGapIndices.push(j);
    }
    if (possibleWallIndices.length < 1 || possibleGapIndices.length < 1) {
      return;
    }
    const randomWallIndex =
      possibleWallIndices[
        Math.floor(Math.random() * possibleWallIndices.length)
      ];

    const randomGapIndex =
      possibleGapIndices[Math.floor(Math.random() * possibleGapIndices.length)];

    gapNeighbors.push(grid[randomGapIndex][randomWallIndex - 1]);
    gapNeighbors.push(grid[randomGapIndex][randomWallIndex + 1]);

    gapNeighbors = prevGapNeighbors.concat(gapNeighbors);

    for (let r = minRowNum; r <= maxRowNum; r++) {
      if (r !== randomGapIndex && isNotTerminalNode(grid, r, randomWallIndex)) {
        grid[r][randomWallIndex].isWall = true;
      }
    }
    recursiveMazeHelper(
      grid,
      minRowNum,
      minColNum,
      maxRowNum,
      randomWallIndex - 1,
      gapNeighbors
    );
    recursiveMazeHelper(
      grid,
      minRowNum,
      randomWallIndex + 1,
      maxRowNum,
      maxColNum,
      gapNeighbors
    );
  } else {
    //vertical
    const possibleWallIndices = [];
    const possibleGapIndices = [];
    var gapNeighbors = [];
    for (let i = minRowNum + 1; i < maxRowNum; i++) {
      if (checkRowWall(grid, i, minColNum, maxColNum, prevGapNeighbors)) {
        possibleWallIndices.push(i);
      }
    }
    for (let j = minColNum; j <= maxColNum; j++) {
      possibleGapIndices.push(j);
    }
    if (possibleWallIndices.length < 1 || possibleGapIndices.length < 1) {
      return;
    }
    const randomWallIndex =
      possibleWallIndices[
        Math.floor(Math.random() * possibleWallIndices.length)
      ];

    const randomGapIndex =
      possibleGapIndices[Math.floor(Math.random() * possibleGapIndices.length)];

    gapNeighbors.push(grid[randomWallIndex - 1][randomGapIndex]);
    gapNeighbors.push(grid[randomWallIndex + 1][randomGapIndex]);

    gapNeighbors = prevGapNeighbors.concat(gapNeighbors);

    for (let c = minColNum; c <= maxColNum; c++) {
      if (c !== randomGapIndex && isNotTerminalNode(grid, randomWallIndex, c)) {
        grid[randomWallIndex][c].isWall = true;
      }
    }
    recursiveMazeHelper(
      grid,
      minRowNum,
      minColNum,
      randomWallIndex - 1,
      maxColNum,
      gapNeighbors
    );
    recursiveMazeHelper(
      grid,
      randomWallIndex + 1,
      minColNum,
      maxRowNum,
      maxColNum,
      gapNeighbors
    );
  }
}

function isNotTerminalNode(grid, row, col) {
  return !grid[row][col].isStart && !grid[row][col].isFinish;
}

function checkColWall(grid, col, minRow, maxRow, prevGapNeighbors) {
  for (const node of prevGapNeighbors) {
    if (node.col === col && node.row >= minRow && node.row <= maxRow) {
      return false;
    }
  }
  for (var r = minRow; r <= maxRow; r++) {
    const node = grid[r][col];
    if (node.isStart || node.isFinish) {
      return false;
    }
  }
  return true;
}

function checkRowWall(grid, row, minCol, maxCol, prevGapNeighbors) {
  for (const node of prevGapNeighbors) {
    if (node.row === row && node.col >= minCol && node.col <= maxCol) {
      return false;
    }
  }
  for (var c = minCol; c <= maxCol; c++) {
    const node = grid[row][c];
    if (node.isStart || node.isFinish) {
      return false;
    }
  }
  return true;
}

export function generateVShapeMaze(grid) {
  var offset = 0;
  for (var row = 0; row < grid.length; row++) {
    for (var col = 0; col < grid[0].length; col++) {
      grid[row][col].isVisited = false;
      grid[row][col].isWall = false;
    }
  }
  for (let row = 2; row < grid.length; row++) {
    grid[row][row - 1].isWall = true;
  }
  for (let row = 23; row > 3; row--) {
    grid[row][24 + offset].isWall = true;
    offset++;
  }
  return grid;
}

export function generateRandomMaze(grid) {
  for (var row = 0; row < grid.length; row++) {
    for (var col = 0; col < grid[0].length; col++) {
      if (!grid[row][col].isStart && !grid[row][col].isFinish) {
        if (grid[row][col].isWall) {
          grid[row][col].isWall = false;
        }
        const wallDecider = Math.floor(Math.random() * 10);
        if (wallDecider < 3) {
          grid[row][col].isWall = true;
        }
      }
    }
  }
  return grid;
}
