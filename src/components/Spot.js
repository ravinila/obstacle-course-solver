import React, { Component } from "react";
// import { GameContext } from "./../common/context"

export default class Spot extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    // console.log("Spot::", this.props, this.props.activeSpotMaker);
    this.state = {
      type: this.props.type
    };

    this.typeValues = {
      "0": {title: "", className: "", color: "#fff", src: "" },
      "1": {title: "Boulder", className: "boulder", color: "#000", src: "/images/boulder.png" },
      "2": {title: "Gravel", className: "gravel", color: "#aaa", src: "/images/gravel.png" },
      "3": {title: "Wormhole Entrance", className: "wormhole-entrance", color: "#7fffc9", src: "/images/wormhole-entrance.png" },
      "4": {title: "Wormhole Exit", className: "wormhole-exit", color: "#098e19", src: "/images/wormhole-exit.png" },
      "5": {title: "Starting point", className: "start", color: "blue", src: "/images/start.png" },
      "6": {title: "Destination to reach", className: "end", color: "red", src: "/images/end.png" }
    };
  }
  
  changeType(){

    var type = this.props.onTypeChange(this.props.i, this.props.j, this.state.type);

    // this.setState({
    //   type: type
    // });

  }
  /*
  applySpotTypeChange(){
    console.log('111', this.props.activeSpotMaker)
    if (window.___reactMouseDown && this.state.activeSpotMaker !== this.state.type){
      if (this.state.activeSpotMaker > -1 && this.state.activeSpotMaker < 5){
        console.log('activeSpotMaker', this.state.activeSpotMaker)
      }
    }
  } */
  
  static getDerivedStateFromProps(nextProps, prevState){
    // console.log("XX", nextProps, prevState)
    return nextProps;
  }

  render() {

    // console.log("this.state.type", this.props, this.props.activeSpotMaker);
    let type = (this.state.type === -1) ? 0 : (this.state.type || 0);
    const color = this.typeValues[type].color;
    const src = this.typeValues[type].src;
    const title = this.typeValues[type].title;

    var rectStyles = {
      fill: "none",
      strokeWidth: 0.1,
      stroke: "rgb(0,0,0)",
      opacity: 0.5
    };

    return (
      <g>

        <image width={this.props.w/2} height={this.props.h/2}
        x={this.props.i/2 * this.props.w}
        y={this.props.j/2 * this.props.h}
        title={title}
        xlinkHref={src}
        onClick={this.changeType.bind(this)}
        // onMouseMoveCapture={this.applySpotTypeChange.bind(this)}
        // onMouseMove={this.applySpotTypeChange.bind(this)}
        // draggable="true"
        // onDragStart={this.drag.bind(this)}
        // onDrop={this.drop.bind(this)} 
        // onDragOver={this.allowDrop.bind(this)}

        />

        <rect width={this.props.w/2} height={this.props.h/2}
        x={this.props.i/2 * this.props.w}
        y={this.props.j/2 * this.props.h}
        style= {rectStyles} />

        {

        // <text
        // x={this.props.i/2 * this.props.w}
        // y={this.props.j/2 * this.props.h}
        // textAnchor="start" alignmentBaseline="baseline"
        // style={{fontSize: ".4rem", transform: "translateY(5px)"}} >{ this.props.i + ", " + this.props.j}</text>

      }

      </g>
    );
  }
}
