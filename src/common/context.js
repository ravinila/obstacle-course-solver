import React from "react";

const settings = {
    size: {
        width: 500,
        height: 500
    },
    cols: 10,
    rows: 10,
    diagonalAllowed: !false,
    findShortestDistance: !!false
};

export const GameContext = React.createContext(
    {settings: settings}
);