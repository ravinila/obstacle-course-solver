import React, { Component } from "react";
import Spot from "./Spot";
import SpotX from "./SpotX";
import {removeFromArray, heuristic } from "./../common/utility";

export default class Grid extends Component {
  constructor(props) {
    super(props);

    this.grid = this.props.grid;
    this.settings = this.props.settings;
    this.wormholeExits = [];
    this.wormholeEntrances = [];
    this.w = this.settings.size.width / this.settings.cols;
    this.h = this.settings.size.height / this.settings.rows;

    this.start = false;
    this.end = false;

    this.state = {
      polylines: [],
      gridX: [],
      activeSpotMaker: props.activeSpotMaker,
      findShortestDistance: props.findShortestDistance
    }

    /*  */
    this.setupGrid();
  }

  setupGrid() {

    var w = this.settings.size.width / this.settings.cols,
      h = this.settings.size.height / this.settings.rows;

    // Making 2D Array
    for (let i = 0; i < this.settings.cols; i++) {
      this.grid[i] = new Array(this.settings.rows);
      this.state.gridX[i] = new Array(this.settings.rows);
    }

    for (let i = 0; i < this.settings.cols; i++) {
      for (let j = 0; j < this.settings.rows; j++) {

        this.state.gridX[i][j] = new SpotX({
          i: i,
          j: j,
          width: w,
          height: h,
          settings: this.settings,
        });

        // console.log("Keys", Object.keys(this.state.gridX[i][j]) )
      }
    }

    for (let i = 0; i < this.settings.cols; i++) {
      for (let j = 0; j < this.settings.rows; j++) {
        this.state.gridX[i][j].addNeighbors(this.state.gridX);

      }
    }

    this.start = this.state.gridX[0][0];
    this.end = this.state.gridX[this.settings.cols - 1][this.settings.rows - 1];

    this.start.type = 5;
    this.end.type = 6;


  }

  componentDidMount(){
    this.findBestRoute();
    this.setState({});
  }
  componentDidUpdate(){
    this.findBestRoute();
    // this.setState({});
  }

  onSpotTypeChange(i, j, type) {
    // console.log('spot change', i, j, type);

    console.log('type clicked', this.state.type, type, this.props.activeSpotMaker);
    // var type;

    if (type === 5 || type === 6) return;

    if (type === this.props.activeSpotMaker) return type;

    if (this.props.activeSpotMaker === -1) {
      type = type + 1;
      if (type > 4) type = 0;
    }
    else if(this.props.activeSpotMaker === 5){
      // console.log("this.start.type", this.start.type)
      this.start.type = 0;
      this.start = this.state.gridX[i][j];
      this.start.type = 5;
      type = 5;
    }
    else if(this.props.activeSpotMaker === 6){
      this.end.type = 0;
      this.end = this.state.gridX[i][j];
      this.end.type = 6;
      type = 6;
    }
    else {
      type = this.props.activeSpotMaker;
    }

    /* -------------- */

    var spot = this.state.gridX[i][j];
    spot.type = type;

    if (type === 4) {
      this.state.gridX[i][j].addNeighbors(this.state.gridX);

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

    this.setState({
      activeSpotMaker: type
    });

    this.findBestRoute(this.start, this.end, 0, 0);
    // console.log("wormholeEntrances", this.wormholeEntrances);
    // console.log("wormholeExits", this.wormholeExits);
    return type;
  }
  findBestRoute(start, end){

    // console.log("findBestRoute", "prev", this.start.previous, this.end);
    // console.log("findBestRoute", "prev", this.start, start, this.end, end);
    // console.log("this.findShortestDistance", this.props.findShortestDistance)

    var that = this;
    start = this.start || start || this.state.gridX[0][0];
    end = this.end || end || this.state.gridX[this.settings.cols - 1][this.settings.rows - 1];

    start.previous = undefined;

    var _currentRoute = this.findRoute(start, end);
    var _currentRouteLen = findPathLength(_currentRoute);

    if(!_currentRoute){
      /* NO ROUTE FOUND */
      console.log("NO ROUTE FOUND");
      this.score = false;

      this.drawPath(false);
      return;
    }

    console.log('b4 getpaths');
    var _finalPaths = getPaths(_currentRoute);

    console.log("_finalPaths", _finalPaths);

    var fs = [];
    if(this.wormholeEntrances.length && this.wormholeExits.length){
      for(var i = 0; i < this.wormholeEntrances.length; i++){
        let item = this.findRoute(start, this.wormholeEntrances[i]);

        if( item ){
          fs[i] = item;
        }

      }
    }

    console.log('fs', fs);
    
    if(fs.length){

      fs = fs.sort((item1, item2) => item1.f - item2.f);

      var entranceNode = fs[0];

      var _otherClosedSets = getPaths(entranceNode);

      console.log("entranceNode, _otherClosedSets", entranceNode, _otherClosedSets);

      // var _otherRoute = this.findRoute(entranceNode, end);
      var _otherRoute = this.findRoute(entranceNode, end, _otherClosedSets);

      console.log("_otherRoute", _otherRoute);
      if(_otherRoute){
        var _otherRouteLen = findPathLength(_otherRoute);

        console.log("_currentRouteLen, _otherRouteLen", _currentRouteLen, _otherRouteLen);
        // var pathsToEntrance = getPaths(entranceNode);

        if(_otherRouteLen !== false && _otherRouteLen < _currentRouteLen){
          _finalPaths = getPaths(_otherRoute);
        }

        /* Romove multiples of wormhole_entrance & wormhole_exit */
        _finalPaths = removeDuplicateTypes(_finalPaths, 3);
        _finalPaths = removeDuplicateTypes(_finalPaths.reverse(), 4);

      }
    }

    /* -------------- ----------------- */


    this.score = getScore(_finalPaths);
    this.drawPath(_finalPaths);

    /* DONE */

    function getScore(paths){

      paths = paths || [];

      return paths.reduce(function(agg, current, index, arr){
        let next = arr[index + 1], len, time;
        if(next){

          len = heuristic(current, next) || 0;

          if (current.type === 3 && next.type === 4) {
            len = 0;
          }
          time = len;

          if (!that.state.findShortestDistance) {
            if (current.type === 2) {
              len += (len / 2);
            }
            if (next.type === 2) {
              len += (len / 2);
            }
          }

          if (current.type === 2) {
            time += (time / 2);
          }
          if (next.type === 2) {
            time += (time / 2);
          }

          agg.distance += len;
          agg.time += time;
        }

        return agg;

      }, {distance: 0, time: 0});

    }

    function removeDuplicateTypes(list, type){
      let firstIndex;

      if(Array.isArray(list)){
        for(let i = list.length - 1; i >= 0; i--){
          let spot = list[i];
          if(spot.type === type){
            if(firstIndex){
              list.splice(i, 1);
            }
            else{
              firstIndex = true;
            }
          }
        }
      }

      return list;
    }

    function findPathLength(path){

      var len = 0, time = 0, heu, list = [];
      while (path.previous) {
        var temp = path.previous;

        if(list.includes(temp)){
          return false;
        }
        list.push(temp);

        heu = heuristic(path, temp) || 0;
        
        if(temp.type === 3 && path.type === 4){
          heu = 0;
        }

        if (!that.state.findShortestDistance) {
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
      console.log(2);
      while (temp.previous) {
        // if(temp)
        paths.push(temp.previous);
        temp = temp.previous;
      }
      return paths;
    }

  }

  findRoute(start, end, otherClosedSet) {

    /* A* Algorithm based */
    if(!otherClosedSet) otherClosedSet = [];

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
    // var length = 0;

    while (true) {
      // length++;
      if (openSet.length > 0) {

        var winner = 0;
        for (let i = 0; i < openSet.length; i++) {
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
        // console.log("1", this.props.findShortestDistance);

        var neighbors = current.neighbors;
        for (let i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];
          if (!closedSet.includes(neighbor) && !otherClosedSet.includes(neighbor) && neighbor.type !== 1) {
            if (neighbor.type === 4 && current.type !== 3) {
              continue;
            }
            var heuristicVal = 0;
            if (current.type !== 3) {
              heuristicVal = heuristic(neighbor, current);

              if (!this.state.findShortestDistance) {
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

    console.log("loop done!")

    return current;
    // this.drawPath(current);
  }

  drawPath(paths) {
    console.log("draw paths-------------------");

    if (paths === false) {
      this.state.polylines = []
      // this.setState({
      //   polylines: []
      // });
      return;
    }
    // Find the path
    var w = this.w;
    var h = this.h;

    // path = path.reverse();
    // console.log("total_distance", paths)

    var polylines = [];
    
    for (var i = 0, j = 0; i < paths.length; i++) {
      let item = paths[i];
      let pointString = [item.i / 2 * w + w / 4, item.j / 2 * h + h / 4].join(",") + " ";

      if (!polylines[j]) polylines[j] = { points: "", style: "" };

      if (item.type === 3 || item.type === 4) {
        polylines[j].points += pointString;
        j++;
        polylines[j] = { points: pointString, style: (item.type === 3 ? "4, 4" : "") };
      }
      else {
        polylines[j].points += pointString;
      }

    }

    console.log("polylines", polylines);
    this.state.polylines = polylines;

    // this.setState({
    //   polylines: polylines
    // });
  }

  updateSettings(){
    this.state.findShortestDistance = this.refs.shortest.checked;
    this.findBestRoute();
    this.setState({
      findShortestDistance: this.state.findShortestDistance
    })
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // console.log('getDerivedStateFromProps', nextProps, prevState);
    return nextProps;
  }


  render() {
    // console.log("Grid::render()")
    /* Add grid spots  */
    this.grid = this.state.gridX.map((row, i) => {
      return row.map( (item, j) => {
        return (

            <Spot
            i={i}
            j={j}
            type={item.type}
            onTypeChange={this.onSpotTypeChange.bind(this)}
            w={this.w}
            h={this.h}
            key={"ij" + i + "" + j}
            activeSpotMaker={this.state.activeSpotMaker}
            />

        );
      })
    })

    const width = this.settings.size.width;
    const height = this.settings.size.height;
    let viewBox = "0 0 " + (width / 2) + " " + (height / 2);

    return (
      <div className="grid-container">
        <svg width={width} height={height} viewBox={viewBox}>
          <g>
            {this.grid}
            {this.state.polylines.map(function (d, i) {
              return (
                <g key={i}>
                {
                //     <polyline points={d.points} key={i} fill="none" stroke="#c6edff"
                //   strokeWidth="2"
                //   strokeLinecap="round"
                //   strokeLinejoin="round"
                //   strokeDasharray={d.style}
                // />
                }
                <polyline points={d.points} fill="none" stroke="red"
                // <polyline points={d.points} key={i} fill="none" stroke="#00b3fd"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={d.style}
                />
                </g>
              );
            })}
          </g>
        </svg>
        <br/>
        <br/>

        <div>
          {
            !this.score &&
            <div>
              <span style={{ display: "inline-block", padding: "10px", color: "red" }}>NO ROUTE FOUND</span>
            </div>
          }

          {
            this.score &&
            <div>
              <span style={{ display: "inline-block", padding: "10px" }}>Time: {this.score.time && (this.score.time).toFixed(1)}</span>
              <span style={{ display: "inline-block", padding: "10px" }}>Distance: {this.score.distance && (this.score.distance).toFixed(1)}</span>
            </div>
          }


        </div>
        <input type="checkbox" ref="shortest" id="shortest" defaultChecked={this.props.findShortestDistance} onClick={this.updateSettings.bind(this)} /> <label for="shortest">Find shortest route by distance</label>

        {
          // <button onClick={this.findBestRoute.bind(this, 0,0)}> Find Route </button>
        }

        <br />
        <br />
        <br />
        <div>&nbsp;</div>
      </div>
    );
  }
}
