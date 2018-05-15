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
    this.wormholeEntrances = [];
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
          i: i,
          j: j,
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

  onSpotTypeChange(i, j, type) {
    console.log('spot change', i, j, type)
    var spot = this.gridX[i][j];
    spot.type = type;

    if (type === 4) {
      this.gridX[i][j].addNeighbors(this.gridX);

      if (!this.wormholeExits.includes(spot)) {
        this.wormholeExits.push(spot);
      }
      removeFromArray(this.wormholeEntrances, spot);
    }
    else if(type === 3){

      if (!this.wormholeEntrances.includes(spot)) {
        this.wormholeEntrances.push(spot);
      }
      removeFromArray(this.wormholeExits, spot);
    }
    else {
      removeFromArray(this.wormholeExits, spot);
      removeFromArray(this.wormholeEntrances, spot);
    }

    console.log("wormholeEntrances", this.wormholeEntrances);
    console.log("wormholeExits", this.wormholeExits);

  }
  findBestRoute(start, end){

    var that = this;
    start = start || this.gridX[0][0];
    end = end || this.gridX[this.settings.cols - 1][this.settings.rows - 1];

    var _currentRoute = this.findRoute(start, end);
    var _currentRouteLen = findPathLength(_currentRoute);
    
    if(!_currentRoute){
      /* NO ROUTE FOUND */
      console.log("NO ROUTE FOUND");
      return;
    }

    var _finalPaths = getPaths(_currentRoute);

    console.log("_finalPaths", _finalPaths);

    var fs = [];
    if(this.wormholeEntrances.length && this.wormholeExits.length){
      for(var i = 0; i < this.wormholeEntrances.length; i++){
        let item = this.findRoute(this.gridX[0][0], this.wormholeEntrances[i]);

        if( item ){
          fs[i] = item;
        }

      }
    }

    console.log('fs', fs);
    
    if(fs.length){

      fs = fs.sort((item1, item2) => item1.f - item2.f);

      var entranceNode = fs[0];

      console.log("entranceNode", entranceNode);

      var _otherRoute = this.findRoute(entranceNode, end);

      if(_otherRoute){
        var _otherRouteLen = findPathLength(_otherRoute);

        console.log("_currentRouteLen, _otherRouteLen", _currentRouteLen, _otherRouteLen);
        // var pathsToEntrance = getPaths(entranceNode);

        // console.log("pathsToEntrance", pathsToEntrance);

        // for (var i = pathsToEntrance.length - 1; i > 0; i--) {
        //   let path = pathsToEntrance[i];
        //   // console.log("i", i)
        //   path.h = heuristic(path, end);
        //   path.f = path.g + path.h;
        //   // path.previous = pathsToEntrance[i - 1];
        // }

        // var _otherRoute = this.findRoute(pathsToEntrance[pathsToEntrance.length - 1], end);

        if(_otherRouteLen < _currentRouteLen){
          _finalPaths = getPaths(_otherRoute);
        }

      }
    }
      
    /* -------------- ----------------- */
    this.drawPath(_finalPaths.reverse());

    /* DONE */
    function findPathLength(path){
      
      var len = 0, heu;
      while (path.previous) {
        var temp = path.previous;
        heu = heuristic(path, temp) || 0;

        if(temp.type === 3 && path.type === 4){
          heu = 0;
        }

        if (!that.settings.findShortestDistance) {
          if (temp.type === 2) {
            heu += (heu / 2);
          }
          if (path.type === 2) {
            heu += (heu / 2);
          }
        }

        len += heu;

        path  = temp;
      }
      return len;
    }

    function getPaths(temp){
      var paths = [];
      paths.push(temp);
      while (temp.previous) {
        paths.push(temp.previous);
        temp = temp.previous;
      }
      return paths;
    }

  }

  findRoute(start, end) {

    /* A* Algorithm based */

    var openSet = [];
    var closedSet = [];
    openSet.push(start);

    /* Starts here */
    var nearestWormholeExitHueristic;
    if (this.wormholeExits.length) {
      var _nearHue = heuristic(this.wormholeExits[0], end);
      if(this.wormholeExits.length > 1)
      for (var i = 1; i < this.wormholeExits.length; i++) {
        var _hue = heuristic(this.wormholeExits[i], end);
        _nearHue = (_hue < _nearHue) ? _hue : _nearHue;
      }
      nearestWormholeExitHueristic = _nearHue;
    }

    console.log('ravins');
    var length = 0;

    while (true) {
      length++;
      if (openSet.length > 0) {

        var winner = 0;
        for (var i = 0; i < openSet.length; i++) {
          if (openSet[i].f < openSet[winner].f) {
            winner = i;
          }
        }

        var current = openSet[winner];

        if (current === end) {
          console.log("PATH FOUND!");
          break;
        }

        removeFromArray(openSet, current);
        closedSet.push(current);

        if (current.type === 3) {
          if (!this.wormholeExits.length) {
            continue;
          }
          current.neighbors = this.wormholeExits;
        }
        // console.log(current, "----")

        var neighbors = current.neighbors;
        for (var i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];
          if (!closedSet.includes(neighbor) && neighbor.type !== 1) {
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
            if (openSet.includes(neighbor)) {
              if (tempG < neighbor.g) {
                neighbor.g = tempG;
                newPath = true;
              }
            } else {
              neighbor.g = tempG;
              newPath = true;
              openSet.push(neighbor);
            }

            if (newPath) {
              neighbor.h = heuristic(neighbor, end);
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
        // this.drawPath(false);
        return false;
        // no solution
      }
    }

    return current;
    // this.drawPath(current);
  }

  drawPath(paths) {
    console.log("draw paths-------------------");

    if (paths === false) {
      this.setState({
        polylines: []
      });
      return;
    }
    // Find the path
    var w = this.w;
    var h = this.h;

    // path = path.reverse();
    // console.log("total_distance", paths)

    var polylines = [];
    var arrPolyline = [];
    var temp;
    for (var i = 0, j = 0; i < paths.length; i++) {
      let item = paths[i];
      let pointString = [item.i / 2 * w + w / 4, item.j / 2 * h + h / 4].join(",") + " ";

      if (!polylines[j]) polylines[j] = { points: "", style: "" };

      if (item.type === 3 || item.type === 4) {
        polylines[j].points += pointString;
        j++;
        polylines[j] = { points: pointString, style: (item.type === 3 ? "2, 2" : "") };
      }
      else {
        polylines[j].points += pointString;
      }

      // arrPolyline.push([path[i].i/2 * w + w/4, path[i].j/2 * h + h/4 ].join(",") + " ");
    }

    // console.log("polylines", polylines.slice());

    // var index1 = path.indexOf(path.find(function (item) { return item.type === 3 }));
    // var index2 = path.indexOf(path.find(function (item) { return item.type === 4 }));

    // console.log(arrPolyline, index1, index2);

    // if(index1 > -1 && index2 > -1){

    //   var _arr = arrPolyline.slice(0, index1+1);

    //   addPolyline(polylines, _arr);

    //   _arr = arrPolyline.slice(index1 || (index1 ? index1 - 1 : 0), index2+1);

    //   addPolyline(polylines, _arr, "2, 2");

    //   _arr = arrPolyline.slice(index2);

    //   addPolyline(polylines, _arr);
    // }
    // else{
    //   addPolyline(polylines, arrPolyline);
    // }

    // function addPolyline(polylines, _arr, style) {
    //   if(Array.isArray(polylines) && Array.isArray(_arr) && _arr.length){
    //     polylines.push({
    //       points: _arr.join(" "),
    //       style: style || ""
    //     });
    //   }
    // }

    console.log("polylines", polylines);
    this.setState({
      polylines: polylines
    })
  }

  render() {

    /* Add grid spots  */
    for (var i = 0; i < this.settings.cols; i++) {
      for (var j = 0; j < this.settings.rows; j++) {

        let type = this.gridX[i][j].type;
        this.grid[i][j] = (
          <Spot
            i={i}
            j={j}
            type={type}
            onTypeChange={this.onSpotTypeChange.bind(this)}
            w={this.w}
            h={this.h}
            key={i + j} />
        );

      }
    }

    const width = this.settings.size.width;
    const height = this.settings.size.height;
    let viewBox = "0 0 " + (width / 2) + " " + (height / 2);

    return (
      <div>
        <svg width={width} height={height} viewBox={viewBox} >
          <g>
            {this.grid}
            {this.state.polylines.map(function (d, i) {
              return (
                <polyline points={d.points} key={i} fill="none" stroke="red"
                  strokeWidth="1"
                  strokeDasharray={d.style}
                />
              );
            })}
          </g>
        </svg>

        <button onClick={this.findBestRoute.bind(this, 0,0)}> Find Route </button>
      </div>
    );
  }
}
