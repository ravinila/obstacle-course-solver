import React, { Component } from "react";

export default class Spot extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    console.log("Spot::", this.props);
    this.state = {
      type: this.props.type
    };

    this.typeValues = {
      "0" : {title: "none", color: "#fff"},
      "1" : {title: "boulder", color: "#000"},
      "2" : {title: "gravel", color: "#aaa"},
      "3" : {title: "wormhole entrance", color: "#7fffc9"},
      "4" : {title: "wormhole exit", color: "#098e19"}
    }
  }
  
  changeType(){
    console.log('type clicked')
    var type = this.state.type + 1;
    if(type > 4) type = 0;

    this.props.onTypeChange(this.props.i, this.props.j, type);
    
    this.setState({
      type: type
    });
  }
  render() {
    
    const color = this.typeValues[this.state.type].color;
    const title = this.typeValues[this.state.type].title;
    
    var rectStyles = {
      fill: color,
      strokeWidth: 0.1,
      stroke: "rgb(0,0,0)"
    };

    return (
      <g>
        <rect width={this.props.w/2} height={this.props.h/2}
        x={this.props.i/2 * this.props.w}
        y={this.props.j/2 * this.props.h}
        title={title}

        onClick={this.changeType.bind(this)}
        style= {rectStyles} />
      </g>
    );
  }
}
