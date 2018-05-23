import React, { Component } from "react";

export default class SpotMaker extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.spot = this.props.spot;
  }
  
  selectSpotMaker(e){
    this.props.onSpotMakerSelect(e, this.spot.type);
  }

  render() {

    let classes = "spotmaker";
    classes += " " + this.spot.className;
    
    if(this.props.activeSpot === this.spot.type){
        classes += " active";
    }

    const styles = {
      backgroundImage: "url(" + this.spot.src + ")",
    }

    return (
      <div style={styles} className={classes} onClick={this.selectSpotMaker.bind(this)}>

      </div>
    );
  }
}
