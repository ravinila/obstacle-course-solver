import React, { Component } from "react";
import Settings from "./Settings";
import Grid from "./Grid";
import SpotMaker from "./SpotMaker";
import {GameContext} from "./../common/context"

import './../css/styles.css';

export default class Game extends Component {
  static defaultProps = {
    settings: {
      size: {
        width: 500,
        height: 500
      },
      cols: 15,
      rows: 15,
      diagonalPathAllowed: !false,
      findShortestDistance: !!false
    }
  };

  constructor(props) {
    super(props);
    this.grid = [];
    this.spots = [
      { type: 0, title: "Blank Spot", isActive: false, className: "", color: "#fff", src: "" },
      { type: 1, title: "Boulder", isActive: true, className: "boulder", color: "#000", src: "/images/boulder.png" },
      { type: 2, title: "Gravel", isActive: false, className: "gravel", color: "#aaa", src: "/images/gravel.png" },
      { type: 3, title: "Wormhole Entrace", isActive: false, className: "wormhole-entrance", color: "#7fffc9", src: "/images/wormhole-entrance.png" },
      { type: 4, title: "Wormhole Exit", isActive: false, className: "wormhole-exit", color: "#098e19", src: "/images/wormhole-exit.png" },
      { type: 5, title: "Start", isActive: false, className: "start", color: "blue", src: "/images/start.png" },
      { type: 6, title: "End", isActive: false, className: "end", color: "red", src: "/images/end.png" }
    ];

    this.gridChild = React.createRef();


    var settings = this.props.settings;

    this.state = {
      activeSpotMaker: -1,
      findShortestDistance: settings.findShortestDistance
    }
  }

  _handleKeyDown(event) {
    switch (event.keyCode) {
      case 27:
        this.setState({
          activeSpotMaker: -1
        });
        break;
      default:
        break;
    }
  }

  _handleMouseDown(event) {
    console.log(event)
    if (event.which === 1) {
      window.___reactMouseDown = true;
    }
  }

  componentWillMount() {
    document.addEventListener("keydown", this._handleKeyDown.bind(this));
    // document.addEventListener("mousedown", this._handleMouseDown.bind(this));
    // document.addEventListener("mouseup", this._handleMouseUp.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown.bind(this));
    // document.removeEventListener("mousedown", this._handleMouseDown.bind(this));
    // document.removeEventListener("mouseup", this._handleMouseUp.bind(this));
  }

  updateScore(score){
    this.setState({
      score: score
    })
  }

  selectSpotMaker(e, type){
    this.setState({
      activeSpotMaker: type
    });
  }

  render() {
    console.log("this.state.activeSpotMaker", this.state.activeSpotMaker)
    let spotObject = this.spots[this.state.activeSpotMaker];
    let styles = {}
    if(spotObject){
      styles.userSelect = "none";
    }

    return (
      <div style={styles} className={this.state.activeSpotMaker}>
        <h2>Path finder with obstacles</h2>
        <div>
          Please select any of the obstacle and place it on the grid.<br />
          <small>
            If no obstacle is selected, just click on the grid to toggle between obstacles<br />
            (Press ESC to cancel the selection)
          </small>
        </div>
        <div className="spotmaker-holder">
        {
          this.spots.map(item => <SpotMaker spot={item} activeSpot={this.state.activeSpotMaker} onSpotMakerSelect={this.selectSpotMaker.bind(this)} key={item.type}/>)
        }
        </div>
        <Grid
          ref={this.gridChild}
          grid={this.grid}
          {...this.props}
          activeSpotMaker={this.state.activeSpotMaker}
          findShortestDistance={this.state.findShortestDistance}
          onScoreUpdate={this.updateScore.bind(this)}
        />
        
      </div>
    );
  }
}
