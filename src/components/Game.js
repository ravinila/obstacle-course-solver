import React, { Component } from "react";
import Grid from "./Grid";

export default class Game extends Component {
  static defaultProps = {
    settings: {
      size: {
        width: 500,
        height: 500
      },
      cols: 10,
      rows: 10,
      diagonalAllowed: !false,
      findShortestDistance: !false
    }
  };

  constructor(props) {
    super(props);
    this.grid = [];
  }

  render() {
    return (
      <div>
        <div>This is Header</div>
        <Grid
          grid={this.grid} {...this.props}
        />
      </div>
    );
  }
}
