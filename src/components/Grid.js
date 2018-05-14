import React, { Component } from "react";
import Spot from "./Spot";
import SpotX from "./SpotX";
import { dist, removeFromArray, heuristic } from "./../common/utility";

export default class Grid extends Component {
  constructor(props) {
    super(props);
    console.log("Grid::", this.props);
    this.grid = this.props.grid;
    this.gridX = [];
    this.settings = this.props.settings;
    this.setupGrid();
    this.wormholeExits = [];
    this.w = this.settings.size.width / this.settings.cols;
    this.h = this.settings.size.height / this.settings.rows;

    this.state = {
      polylines: []
    }
    
  }

  setupGrid() {

    var w = this.settings.size.width / this.settings.cols,
      h = this.settings.size.height / this.settings.rows;

    // Making 2D Array
    for (var i = 0; i < this.settings.cols; i++) {
      this.grid[i] = new Array(this.settings.rows);
      this.gridX[i] = new Array(this.settings.rows);
    }

    for (var i = 0; i < this.settings.cols; i++) {
      for (var j = 0; j < this.settings.rows; j++) {

        this.gridX[i][j] = new SpotX({
          i : i,
          j : j,
          width: w,
          height: h,
          settings: this.settings,
        });

        // console.log("Keys", Object.keys(this.gridX[i][j]) )
      }
    }

    for (var i = 0; i < this.settings.cols; i++) {
      for (var j = 0; j < this.settings.rows; j++) {
        this.gridX[i][j].addNeighbors(this.gridX);
      }
    }

  }

  onSpotTypeChange(i, j, type){
    console.log('spot change', i, j, type)
    var spot = this.gridX[i][j];
    spot.type = type;

    if(type === 4){
      this.gridX[i][j].addNeighbors(this.gridX);

      if (!this.wormholeExits.includes(spot)) {
        this.wormholeExits.push(spot);
      }
    }
    else{
        removeFromArray(this.wormholeExits, spot);
    }

    console.log("wormholeExits", this.wormholeExits)

  }

  findRoute(){

    /* A* Algorithm based */
    this.start = this.start || this.gridX[0][0];
    this.end = this.end || this.gridX[this.settings.cols - 1][this.settings.rows - 1];

    this.openSet = [];
    this.closedSet = [];
    this.openSet.push(this.start);

    if (this.polyline) {
      this.polyline.remove();
    }

    /* Starts here */

    if (this.wormholeExits.length) {
      var _nearHue = heuristic(this.wormholeExits[0], this.end);
      for (var i = 1; i < this.wormholeExits.length; i++) {
        var _hue = heuristic(this.wormholeExits[i], this.end);
        _nearHue = (_hue < _nearHue) ? _hue : _nearHue;
      }
      var nearestWormholeExitHueristic = _nearHue;
    }

    console.log('ravins');
    var length = 0;

    while (true) {
      length++;
      if (this.openSet.length > 0) {

        var winner = 0;
        for (var i = 0; i < this.openSet.length; i++) {
          if (this.openSet[i].f < this.openSet[winner].f) {
            winner = i;
          }
        }
        var current = this.openSet[winner];

        if (current === this.end) {
          console.log("PATH FOUND!");
          break;
        }

        removeFromArray(this.openSet, current);
        this.closedSet.push(current);

        if (current.type === 3) {
          if (!this.wormholeExits.length) {
            continue;
          }
          current.neighbors = this.wormholeExits;
        }

        var neighbors = current.neighbors;
        for (var i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];
          if (!this.closedSet.includes(neighbor) && neighbor.type !== 1) {
            if (neighbor.type === 4 && current.type !== 3) {
              continue;
            }
            var heuristicVal = 0;
            if (current.type !== 3) {
              heuristicVal = heuristic(neighbor, current);

              if (!this.settings.findShortestDistance) {
                if (neighbor.type === 2) {
                  heuristicVal += (heuristicVal / 2);
                }
                if (current.type === 2) {
                  heuristicVal += (heuristicVal / 2);
                }
              }
            }

            var tempG = current.g + heuristicVal;

            var newPath = false;
            if (this.openSet.includes(neighbor)) {
              if (tempG < neighbor.g) {
                neighbor.g = tempG;
                newPath = true;
              }
            } else {
              neighbor.g = tempG;
              newPath = true;
              this.openSet.push(neighbor);
            }

            if (newPath) {
              neighbor.h = heuristic(neighbor, this.end);
              if (neighbor.type === 3) {
                neighbor.h = nearestWormholeExitHueristic;
              }
              neighbor.f = neighbor.g + neighbor.h;
              neighbor.previous = current;
            }
          }

        }
        // we can keep going
      } else {
        console.log('NO PATH FOUND!');
        this.drawPath(false);
        return;
        // no solution
      }
    }

    this.drawPath(current);
  }

  drawPath(current){
    console.log("draw path")

    if (current === false){
      this.setState({
        polylines: []
      });
      return;
    }
    // Find the path
    var w = this.w;
    var h = this.h;
    
    var path = [];
    var temp = current;
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }

    path = path.reverse();
    console.log("total_distance", path)

    var polylines = [];
    var arrPolyline1 = [];
    for (var i = 0; i < path.length; i++) {
      arrPolyline1.push([path[i].i/2 * w + w/4, path[i].j/2 * h + h/4 ].join(","));
    }

    console.log("path",path.find(function (item) { return item.type === 3 }))
    console.log("path",path.find(function (item) { return item.type === 4 }))

    var index1 = path.indexOf(path.find(function (item) { return item.type === 3 }));
    var index2 = path.indexOf(path.find(function (item) { return item.type === 4 }));

    var arrPolyline2 = arrPolyline1.splice(index1, index2);

    polylines = [arrPolyline1.join(" "), arrPolyline2.join(" ")];

    // var polyline = draw.polyline().plot(arrPolyline).fill("none");
    // polyline.stroke({ color: '#f06', width: 2, linecap: 'round', linejoin: 'round' });

    this.setState({
      polylines: polylines
    })
  }

  render() {

    /* Add grid spots  */
    for (var i = 0; i < this.settings.cols; i++) {
      for (var j = 0; j < this.settings.rows; j++) {

        // console.log(i, j, this.gridX[i][j]);
        // let item = this.gridX[i][j];
        // let _x = {}, keys = Object.keys(item);
        // for (var key in keys) {
        //   _x[key] = item[key];
        // }
        let type = this.gridX[i][j].type;
        this.grid[i][j] = (
          <Spot
            i={i}
            j={j}
            type = {type}
            onTypeChange={this.onSpotTypeChange.bind(this)}
            w={this.w}
            h={this.h}
            key = {i + j} />
        );

      }
    }

    const width = this.settings.size.width;
    const height = this.settings.size.height;
    let viewBox = "0 0 " + (width/2) + " " + (height/2);
    // viewBox = " 0 0 100 100";

    return (
      <div>
        <svg width={width} height={height} viewBox={viewBox} >
        <g>
        {this.grid}
        {this.state.polylines.map(function (d, i) {
          return <polyline points={d} key={i} fill="none" stroke="red" strokeWidth="1" />;
        })}
        </g>
      </svg>

      <button onClick={this.findRoute.bind(this)}> Find Route </button>
      </div>
    );
  }
}
