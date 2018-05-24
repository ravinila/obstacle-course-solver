import React from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import Game from "./components/Game";

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center"
};

const App = () => (
  <div style={styles}>
    <Game />
  </div>
);

render(<App />, document.getElementById("root"));
