# Obstacle Course Solver

To execute this repo


```
git clone https://github.com/ravinila/obstacle-course-solver.git

npm install
npm start
```


# Problem description

Your assignment is to create a visual **obstacle course solver**. The obstacle course game is
played on a grid of cells. The object of the game is to calculate a route from the starting
location to the target location, navigating the terrain in the grid. Each game starts with a
blank grid and consists of 2 phases:

1. The player places the **starting location**, the **target location** and a number of
**obstacles** on cells on the grid.
2. The solver **calculates the shortest route** from the starting location to the target
location and **displays the route** on the grid.

## The obstacles that can be placed are:

The obstacles that can be placed are:
* __boulder__ -- there is no way to travel through boulders
* __gravel__ -- when travelling across gravel you can only go at half the speed of travel
across regular terrain
* __wormhole entrance__ -- you can travel instantaneously to any wormhole exit from this
location
* __wormhole exit__ -- this location can be reached instantaneously from any wormhole
entrance

Keep the following in mind:

* There is only one starting and one target location per game.
* If the solver is unable to calculate a route, it displays a message to that effect.
