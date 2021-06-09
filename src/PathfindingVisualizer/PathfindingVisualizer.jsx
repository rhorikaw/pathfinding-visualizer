import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import { aStar } from "../algorithms/a-star";
import { depthFirst } from "../algorithms/depth-first";
import { greedyBFS } from "../algorithms/best-first";
import { breadthFirst } from "../algorithms/breadth-first";
import { bidirectionalBFS } from "../algorithms/bidirectionalBFS";

import {
  generateRandomMaze,
  generateVShapeMaze,
  generateSimpleMaze,
  generateRecursiveMaze,
} from "../mazeGenerator";

import "./PathfindingVisualizer.css";

const weightDictionary = {
  goblin: 2,
  ogre: 5,
  witch: 10,
  bear: 15,
  dragon: 25,
};


var START_NODE_ROW = 12;
var START_NODE_COL = 5;
var FINISH_NODE_ROW = 12;
var FINISH_NODE_COL = 39;

var GRID_ROW_NUM = 25;
var GRID_COL_NUM = 45;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      boardIsCleared: true,
      mouseIsPressed: false,
      wallSelected: true,
      pressedStart: false,
      pressedFinish: false,
      algorithm: null,
      heuristic: null,
      obstacle: "wall",
      speed: 1,
      visitedNodes: 0,
      totalCost: 0,
      height: 0,
      width: 0
    };
  }

  setAlgorithm(algorithmName) {
    const newGrid = this.state.grid.slice();
    if (!document.getElementById("visualize").disabled) {
      resetGrid(newGrid);
    }
    if (algorithmName !== "greedy" && algorithmName !== "a*") {
      disableListElementButton("manhattan");
      disableListElementButton("euclidean");
      this.setState({
        heuristic: null,
      })
    } else {
      enableListElementButton("manhattan");
      enableListElementButton("euclidean");
    }
    if (algorithmName === "breadth" || algorithmName === "depth") {
      disableListElementButton("goblin");
      disableListElementButton("ogre");
      disableListElementButton("witch");
      disableListElementButton("bear");
      disableListElementButton("dragon");
      this.setState({
        algorithm: algorithmName,
        obstacle: "wall",
        grid: newGrid,
      });
    } else {
      enableListElementButton("goblin");
      enableListElementButton("ogre");
      enableListElementButton("witch");
      enableListElementButton("bear");
      enableListElementButton("dragon");
      this.setState({ algorithm: algorithmName, grid: newGrid });
    }
  }

  setHeuristic(heuristicName) {
    if (!document.getElementById(heuristicName).disabled) {
      this.setState({ heuristic: heuristicName });
    }
  }
  setObstacle(obstacleName) {
    if (obstacleName !== "wall") {
      if (!document.getElementById(obstacleName).disabled) {
        this.setState({ obstacle: obstacleName });
      }
    } else {
      this.setState({ obstacle: obstacleName });
    }
  }

  setSpeed(speedVal) {
    this.setState({ speed: speedVal });
  }

  setVisitedNodes(nodeNum) {
    this.setState({ visitedNodes: nodeNum });
  }

  setCost(costVal) {
    this.setState({ totalCost: costVal });
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    if (row === START_NODE_ROW && col === START_NODE_COL) {
      this.setState({ pressedStart: true, mouseIsPressed: true });
    } else if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) {
      this.setState({ pressedFinish: true, mouseIsPressed: true });
    } else {
      if (this.state.obstacle === "wall") {
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({
          grid: newGrid,
          mouseIsPressed: true,
          wallSelected: true,
        });
      } else {
        const newGrid = getNewGridWithObstacleToggled(
          this.state.grid,
          row,
          col,
          this.state.obstacle
        );
        this.setState({
          grid: newGrid,
          mouseIsPressed: true,
          wallSelected: false,
        });
      }
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) {
      return;
    }
    if (this.state.pressedStart) {
      const newGrid = updateStartNode(this.state.grid, row, col);
      if (newGrid !== null) {
        this.setState({ grid: newGrid });
      }
    } else if (this.state.pressedFinish) {
      const newGrid = updateFinishNode(this.state.grid, row, col);
      if (newGrid !== null) {
        this.setState({ grid: newGrid });
      }
    } else if (this.state.wallSelected) {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    } else {
      const newGrid = getNewGridWithObstacleToggled(
        this.state.grid,
        row,
        col,
        this.state.obstacle
      );
      this.setState({ grid: newGrid });
    }
  }

  handleMouseUp() {
    if (this.state.pressedStart) {
      this.setState({ pressedStart: false });
    } else if (this.state.pressedFinish) {
      this.setState({ pressedFinish: false });
    }
    this.setState({ mouseIsPressed: false });
  }



  clearBoard() {
    const { grid } = this.state;
    const newGrid = clearGrid(grid);
    this.setState({ grid: newGrid });
  }

  resetBoard() {
    const { grid } = this.state;
    const newGrid = resetGrid(grid);
    this.setState({ grid: newGrid });
  }

  updateGrid(newGrid) {
    const newMazeGrid = resetGrid(newGrid);
    this.setState({ grid: newMazeGrid });
  }

  animateShortestPath(nodesInShortestPathOrder) {
    const speed = 1 / parseFloat(this.state.speed);
    for (let i = 0; i <= nodesInShortestPathOrder.length; i++) {
      if (i === nodesInShortestPathOrder.length) {
        setTimeout(() => {
          enableButton("visualize");
          enableButton("clear");
          enableButton("reset");
          enableMazeButtons();
        }, 30 * speed * i);
      } else {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          if (
            !(
              (node.row === START_NODE_ROW && node.col === START_NODE_COL) ||
              (node.row === FINISH_NODE_ROW && node.col === FINISH_NODE_COL)
            )
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-path";
          }
        }, 30 * speed * i);
      }
    }
  }

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    const speed = 1 / parseFloat(this.state.speed);
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.setVisitedNodes(i);
          this.setCost(
            nodesInShortestPathOrder[nodesInShortestPathOrder.length - 1]
              .distance
          );
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 20 * speed * i);
      } else {
        setTimeout(() => {
          const node = visitedNodesInOrder[i];
          if (
            !(
              (node.row === START_NODE_ROW && node.col === START_NODE_COL) ||
              (node.row === FINISH_NODE_ROW && node.col === FINISH_NODE_COL)
            )
          ) {
            if (node.obstacleType === null) {
              document.getElementById(
                `node-${node.row}-${node.col}`
              ).className = "node node-visited";
            } else {
              document.getElementById(
                `node-${node.row}-${node.col}`
              ).className = `node node-${node.obstacleType}-visited`;
            }
          }
        }, 20 * speed * i);
      }
    }
  }

  animateBidirectional(visitedNodesInOrder, nodesInShortestPathOrder) {
    const speed = 1 / parseFloat(this.state.speed);
    const visitedFromStart = visitedNodesInOrder["start"];
    const visitedFromFinish = visitedNodesInOrder["finish"];
    var visitedLength;
    if (visitedFromFinish.length > visitedFromStart.length) {
      visitedLength = visitedFromFinish.length;
    } else {
      visitedLength = visitedFromStart.length;
    }

    for (let i = 0; i <= visitedLength; i++) {
      if (i === visitedLength) {
        setTimeout(() => {
          this.setVisitedNodes(i);
          this.setCost(
            nodesInShortestPathOrder[nodesInShortestPathOrder.length - 1]
              .distance
          );
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 20 * speed * i);
      } else {
        setTimeout(() => {
          if (i < visitedFromStart.length) {
            const nodeFromStart = visitedFromStart[i];
            if (
              !(
                (nodeFromStart.row === START_NODE_ROW &&
                  nodeFromStart.col === START_NODE_COL) ||
                (nodeFromStart.row === FINISH_NODE_ROW &&
                  nodeFromStart.col === FINISH_NODE_COL)
              )
            ) {
              if (nodeFromStart.obstacleType === null) {
                document.getElementById(
                  `node-${nodeFromStart.row}-${nodeFromStart.col}`
                ).className = "node node-visited";
              } else {
                document.getElementById(
                  `node-${nodeFromStart.row}-${nodeFromStart.col}`
                ).className = `node node-${nodeFromStart.obstacleType}-visited`;
              }
            }
          }
          if (i < visitedFromFinish.length) {
            const nodeFromFinish = visitedFromFinish[i];
            if (
              !(
                (nodeFromFinish.row === START_NODE_ROW &&
                  nodeFromFinish.col === START_NODE_COL) ||
                (nodeFromFinish.row === FINISH_NODE_ROW &&
                  nodeFromFinish.col === FINISH_NODE_COL)
              )
            ) {
              if (nodeFromFinish.obstacleType === null) {
                document.getElementById(
                  `node-${nodeFromFinish.row}-${nodeFromFinish.col}`
                ).className = "node node-visited";
              } else {
                document.getElementById(
                  `node-${nodeFromFinish.row}-${nodeFromFinish.col}`
                ).className = `node node-${nodeFromFinish.obstacleType}-visited`;
              }
            }
          }
        }, 20 * speed * i);
      }
    }
  }

  visualizeAlgorithm(algorithmID, heuristicID) {
    const { grid } = this.state;
    disableButton("visualize");
    disableButton("clear");
    disableButton("reset");
    disableMazeButtons();
    if (algorithmID === null) {
      alert("Please select an algorithm!");
      enableButton("visualize");
      enableButton("clear");
      enableButton("reset");
      enableMazeButtons();
      return;
    }
    if (!this.state.boardIsCleared) {
      resetGrid(grid);
    } else {
      this.setState({ boardIsCleared: false });
    }
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    var visitedNodesInOrder;
    if (algorithmID === "dijkstra") {
      visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    } else if (algorithmID === "a*") {
      if (heuristicID === null) {
        alert("Please select a heuristic!");
        enableButton("visualize");
        enableButton("clear");
        enableButton("reset");
        enableMazeButtons();
        return;
      }
      visitedNodesInOrder = aStar(grid, startNode, finishNode, heuristicID);
    } else if (algorithmID === "depth") {
      visitedNodesInOrder = depthFirst(grid, startNode, finishNode);
    } else if (algorithmID === "greedy") {
      if (heuristicID === null) {
        alert("Please select a heuristic!");
        enableButton("visualize");
        enableButton("clear");
        enableButton("reset");
        enableMazeButtons();
        return;
      }
      visitedNodesInOrder = greedyBFS(grid, startNode, finishNode, heuristicID);
    } else if (algorithmID === "breadth") {
      visitedNodesInOrder = breadthFirst(grid, startNode, finishNode);
    } else if (algorithmID === "bidirectional") {
      visitedNodesInOrder = bidirectionalBFS(grid, startNode, finishNode);
      const nodesInShortestPathOrder = visitedNodesInOrder["shortestPath"];
      this.setVisitedNodes(null);
      this.setCost(null);
      this.animateBidirectional(
        {
          start: visitedNodesInOrder["start"],
          finish: visitedNodesInOrder["finish"],
        },
        nodesInShortestPathOrder
      );
      return;
    }
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.setVisitedNodes(null);
    this.setCost(null);
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  render() {
    const { grid, mouseIsPressed } = this.state;
    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="styles"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <script src="//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
        <div className="navbar-container">
          <li className="dropdown">
            <a className="dropbtn-med" data-toggle="dropdown-content">
              {getAlgorithmButtonContent(this.state.algorithm)}{" "}
              <i className="fa fa-caret-down"></i>
            </a>
            <div className="dropdown-content">
              <a onClick={() => this.setAlgorithm("dijkstra")}>Dijkstra</a>
              <a onClick={() => this.setAlgorithm("a*")}>A*</a>
              <a onClick={() => this.setAlgorithm("greedy")}>
                Greedy Best First Search
              </a>
              <a onClick={() => this.setAlgorithm("breadth")}>
                Breadth First Search
              </a>
              <a onClick={() => this.setAlgorithm("bidirectional")}>
                Bidirectional Breadth First Search
              </a>
              <a onClick={() => this.setAlgorithm("depth")}>
                Depth First Search
              </a>
            </div>
          </li>
          <li className="dropdown">
            <a className="dropbtn-med">
              {getHeuristicButtonContent(this.state.heuristic)}{" "}
              <i className="fa fa-caret-down"></i>
            </a>
            <div className="dropdown-content-sml">
              <a
                id="manhattan"
                onClick={() => this.setHeuristic("manhattan")}
                onMouseOver={() => mouseListElementHover("manhattan")}
                onMouseLeave={() => mouseListElementLeave("manhattan")}
              >
                Manhattan
              </a>
              <a
                id="euclidean"
                onClick={() => this.setHeuristic("euclidean")}
                onMouseOver={() => mouseListElementHover("euclidean")}
                onMouseLeave={() => mouseListElementLeave("euclidean")}
              >
                Euclidean
              </a>
            </div>
          </li>
          <li className="dropdown">
            <a className="dropbtn-sml">
              {getObstacleButtonContent(this.state.obstacle)}{" "}
              <i className="fa fa-caret-down"></i>
            </a>
            <div className="dropdown-content-sml">
              <a onClick={() => this.setObstacle("wall")}>
                Wall (Cost: Infinity)
              </a>
              <a
                id="goblin"
                onClick={() => this.setObstacle("goblin")}
                onMouseOver={() => mouseListElementHover("goblin")}
                onMouseLeave={() => mouseListElementLeave("goblin")}
              >
                Goblin (Cost: 2)
              </a>
              <a
                id="ogre"
                onClick={() => this.setObstacle("ogre")}
                onMouseOver={() => mouseListElementHover("ogre")}
                onMouseLeave={() => mouseListElementLeave("ogre")}
              >
                Ogre (Cost: 5)
              </a>
              <a
                id="witch"
                onClick={() => this.setObstacle("witch")}
                onMouseOver={() => mouseListElementHover("witch")}
                onMouseLeave={() => mouseListElementLeave("witch")}
              >
                Witch (Cost: 10)
              </a>
              <a
                id="bear"
                onClick={() => this.setObstacle("bear")}
                onMouseOver={() => mouseListElementHover("bear")}
                onMouseLeave={() => mouseListElementLeave("bear")}
              >
                Bear (Cost: 15)
              </a>
              <a
                id="dragon"
                onClick={() => this.setObstacle("dragon")}
                onMouseOver={() => mouseListElementHover("dragon")}
                onMouseLeave={() => mouseListElementLeave("dragon")}
              >
                Dragon (Cost: 25)
              </a>
            </div>
          </li>
          <li className="dropdown">
            <a className="dropbtn-sml">
              Mazes <i className="fa fa-caret-down"></i>
            </a>
            <div className="dropdown-content-sml">
              <a
                id="simple"
                onClick={() => this.updateGrid(generateSimpleMaze(grid))}
                onMouseOver={() => mouseListElementHover("simple")}
                onMouseLeave={() => mouseListElementLeave("simple")}
              >
                Simple Maze
              </a>
              <a
                id="recursive"
                onClick={() => this.updateGrid(generateRecursiveMaze(grid))}
                onMouseOver={() => mouseListElementHover("recursive")}
                onMouseLeave={() => mouseListElementLeave("recursive")}
              >
                Recursive Division
              </a>
              <a
                id="v"
                onClick={() => this.updateGrid(generateVShapeMaze(grid))}
                onMouseOver={() => mouseListElementHover("v")}
                onMouseLeave={() => mouseListElementLeave("v")}
              >
                V-Shape
              </a>
              <a
                id="random"
                onClick={() => this.updateGrid(generateRandomMaze(grid))}
                onMouseOver={() => mouseListElementHover("random")}
                onMouseLeave={() => mouseListElementLeave("random")}
              >
                Random
              </a>
            </div>
          </li>
          <li className="dropdown">
            <a className="dropbtn-med">
              {getSpeedButtonContent(this.state.speed)}{" "}
              <i className="fa fa-caret-down"></i>
            </a>
            <div className="dropdown-content-sml">
              <a onClick={() => this.setSpeed(0.5)}>Slow (0.5x)</a>
              <a onClick={() => this.setSpeed(1)}>Normal (1.0x)</a>
              <a onClick={() => this.setSpeed(2)}>Fast (2.0x)</a>
              <a onClick={() => this.setSpeed(4)}>Rapid (4.0x)</a>
            </div>
          </li>
          <li>
            <a
              className="smlbtn"
              onClick={() => this.clearBoard()}
              id="clear"
              onMouseOver={() => mouseHover("clear")}
              onMouseLeave={() => mouseLeave("clear")}
            >
              Clear Board
            </a>
          </li>
          <li>
            <a
              className="smlbtn"
              onClick={() => this.resetBoard()}
              id="reset"
              onMouseOver={() => mouseHover("reset")}
              onMouseLeave={() => mouseLeave("reset")}
            >
              Reset Board
            </a>
          </li>
          <li>
            <a
              className="smlbtn"
              onClick={() =>
                this.visualizeAlgorithm(
                  this.state.algorithm,
                  this.state.heuristic
                )
              }
              onMouseOver={() => mouseHover("visualize")}
              onMouseLeave={() => mouseLeave("visualize")}
              id="visualize"
            >
              {getVisualizeButtonContent(
                this.state.algorithm,
                this.state.heuristic
              )}
            </a>
          </li>
        </div>
        <br></br>
        <h3 style={{ padding: "0", margin: "0" }} id="analytics">
          {getAnalyticsContent(this.state.visitedNodes, this.state.totalCost)}
        </h3>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {
                    row,
                    col,
                    isStart,
                    isFinish,
                    isWall,
                    obstacleType,
                    isVisited,
                  } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      row={row}
                      isStart={isStart}
                      isFinish={isFinish}
                      isWall={isWall}
                      obstacleType={obstacleType}
                      isVisited={isVisited}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const updateStartNode = (grid, row, col) => {
  if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) {
    return null;
  }
  const newGrid = grid.slice();
  const oldStartNode = newGrid[START_NODE_ROW][START_NODE_COL];
  const newNode = {
    ...oldStartNode,
    isStart: false,
  };
  newGrid[START_NODE_ROW][START_NODE_COL] = newNode;

  const startNode = newGrid[row][col];
  const newStartNode = {
    ...startNode,
    isStart: true,
  };
  newGrid[row][col] = newStartNode;

  START_NODE_ROW = row;
  START_NODE_COL = col;

  return newGrid;
};

const updateFinishNode = (grid, row, col) => {
  if (row === START_NODE_ROW && col === START_NODE_COL) {
    return null;
  }
  const newGrid = grid.slice();
  const oldFinishNode = newGrid[FINISH_NODE_ROW][FINISH_NODE_COL];
  const newNode = {
    ...oldFinishNode,
    isFinish: false,
  };
  newGrid[FINISH_NODE_ROW][FINISH_NODE_COL] = newNode;

  const finishNode = newGrid[row][col];
  const newFinishNode = {
    ...finishNode,
    isFinish: true,
  };
  newGrid[row][col] = newFinishNode;

  FINISH_NODE_ROW = row;
  FINISH_NODE_COL = col;

  return newGrid;
};

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < GRID_ROW_NUM; row++) {
    const currentRow = [];
    for (let col = 0; col < GRID_COL_NUM; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const clearGrid = (grid) => {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      resetNode(grid, row, col, true);
      if (
        !(
          (row === START_NODE_ROW && col === START_NODE_COL) ||
          (row === FINISH_NODE_ROW && col === FINISH_NODE_COL)
        )
      ) {
        document.getElementById(`node-${row}-${col}`).className = "node";
      }
    }
  }
  return grid;
};

const resetGrid = (grid) => {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      resetNode(grid, row, col, false);
      if (
        !(
          (row === START_NODE_ROW && col === START_NODE_COL) ||
          (row === FINISH_NODE_ROW && col === FINISH_NODE_COL)
        ) &&
        !grid[row][col].isWall
      )
        if (grid[row][col].obstacleType === null) {
          document.getElementById(`node-${row}-${col}`).className = "node";
        } else {
          document.getElementById(
            `node-${row}-${col}`
          ).className = `node node-${grid[row][col].obstacleType}`;
        }
    }
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col: col,
    row: row,
    weight: 1,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    obstacleType: null,
    distance: Infinity,
    heuristicVal: Infinity,
    isVisited: false,
    isWall: false,
    direction: null,
    tieBreak: 0,
    previousNode: null,
    mergePoint: null,
  };
};

const resetNode = (grid, row, col, hardReset) => {
  if (hardReset) {
    grid[row][col].weight = 1;
    grid[row][col].isWall = false;
    grid[row][col].obstacleType = null;
  }
  grid[row][col].distance = Infinity;
  grid[row][col].heuristicVal = Infinity;
  grid[row][col].isVisited = false;
  grid[row][col].previousNode = null;
  grid[row][col].mergePoint = null;
  grid[row][col].direction = null;
  grid[row][col].tieBreak = 0;
};

const getNewGridWithObstacleToggled = (grid, row, col, obstacleName) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (node.obstacleType === obstacleName) {
    const newNode = {
      ...node,
      obstacleType: null,
      weight: 1,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  } else {
    const newNode = {
      ...node,
      obstacleType: obstacleName,
      weight: weightDictionary[obstacleName],
    };
    newGrid[row][col] = newNode;
    return newGrid;
  }
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    obstacleType: null,
    weight: 1,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const disableButton = (elementId) => {
  const button = document.getElementById(elementId);
  button.disabled = true;
  button.style.cursor = "not-allowed";
  button.style.backgroundColor = "rgba(255,0,0,0.65)";
};

const enableButton = (elementId) => {
  const button = document.getElementById(elementId);
  button.disabled = false;
  button.style.cursor = "pointer";
  button.style.backgroundColor = "#735983";
};

const disableListElementButton = (elementId) => {
  const button = document.getElementById(elementId);
  button.disabled = true;
  button.style.cursor = "not-allowed";
  button.style.backgroundColor = "lightgray";
};

const enableListElementButton = (elementId) => {
  const button = document.getElementById(elementId);
  button.disabled = false;
  button.style.cursor = "pointer";
  button.style.backgroundColor = "white";
};

const mouseHover = (elementId) => {
  if (document.getElementById(elementId).disabled === false)
    document.getElementById(elementId).style.backgroundColor = "#CC6686";
};

const mouseLeave = (elementId) => {
  if (document.getElementById(elementId).disabled === false)
    document.getElementById(elementId).style.backgroundColor = "#735983";
};

const mouseListElementHover = (elementId) => {
  if (document.getElementById(elementId).disabled === false)
    document.getElementById(elementId).style.backgroundColor = "#ff687e";
};

const mouseListElementLeave = (elementId) => {
  if (document.getElementById(elementId).disabled === false)
    document.getElementById(elementId).style.backgroundColor = "white";
};

const disableMazeButtons = () => {
  disableListElementButton("simple");
  disableListElementButton("recursive");
  disableListElementButton("v");
  disableListElementButton("random");
};

const enableMazeButtons = () => {
  enableListElementButton("simple");
  enableListElementButton("recursive");
  enableListElementButton("v");
  enableListElementButton("random");
};

const getAlgorithmButtonContent = (algorithmID) => {
  if (algorithmID === null) {
    return "Select an Algorithm";
  } else {
    if (algorithmID === "dijkstra") {
      return "Dijkstra's Algorithm";
    } else if (algorithmID === "breadth") {
      return "Breadth First Search";
    } else if (algorithmID === "bidirectional") {
      return "Bidirectional Search";
    } else if (algorithmID === "depth") {
      return "Depth First Search";
    } else if (algorithmID === "a*") {
      return "A* Search";
    } else {
      return "Greedy Best First Search";
    }
  }
};

const getHeuristicButtonContent = (heuristicID) => {
  if (heuristicID === null) {
    return "Select a heuristic";
  } else {
    if (heuristicID === "manhattan") {
      return "Manhattan";
    } else if (heuristicID === "euclidean") {
      return "Euclidean";
    }
  }
};

const getObstacleButtonContent = (obstacleID) => {
  if (obstacleID === null) {
    return "Select an obstacle";
  } else {
    if (obstacleID === "wall") {
      return "Wall";
    } else if (obstacleID === "goblin") {
      return "Goblin";
    } else if (obstacleID === "ogre") {
      return "Ogre";
    } else if (obstacleID === "witch") {
      return "Witch";
    } else if (obstacleID === "bear") {
      return "Bear";
    } else {
      return "Dragon";
    }
  }
};

const getSpeedButtonContent = (speedVal) => {
  if (speedVal === 0.5) {
    return "Speed: Slow";
  } else if (speedVal === 1) {
    return "Speed: Normal";
  } else if (speedVal === 2) {
    return "Speed: Fast";
  } else {
    return "Speed: Rapid";
  }
};

const getVisualizeButtonContent = (algorithmID, heuristicID) => {
  if (algorithmID === null) {
    return "Select an Algorithm!";
  } else {
    if (algorithmID === "dijkstra") {
      return "Visualize Dijkstra!";
    } else if (algorithmID === "breadth") {
      return "Visualize BFS!";
    } else if (algorithmID === "bidirectional") {
      return "Visualize Bidirectional BFS!";
    } else if (algorithmID === "depth") {
      return "Visualize DFS!";
    } else {
      if (heuristicID === null) {
        return "Select a Heuristic!";
      } else {
        if (algorithmID === "a*") {
          return "Visualize A* (" + heuristicID + ") Search!";
        } else {
          return "Visualize Greedy (" + heuristicID + ") Search!";
        }
      }
    }
  }
};

const getAnalyticsContent = (numVisited, totalCost) => {
  if (numVisited === null) {
    return "Simulating...";
  } else {
    return "Nodes Explored: " + numVisited + " | Total Cost: " + totalCost;
  }
};
