# -*- coding: utf-8 -*-
"""
Created on Fri Aug 26 10:28:13 2022

@author: aelbadra
"""
from eight_queen import EightQueenGameSolver


#### Using a Brute-Force Approach to finding a solution to the 8-Queen problem. Notice the amount of time taken.
#EightQueenGameSolver.brute_force_solution_2()

#### Using a hill climbing approach to find a solution from an initial state very close to a goal state.
#EightQueenGameSolver.hill_climbing([0, 4, 7, 5, 2, 6, 1, 3])

#### Using a hill climbing approach when the initial state is that all eight queens are on the first row.
#EightQueenGameSolver.hill_climbing([0, 0,0,0,0,0,0,0])


#### Using a repeated hill-climbing approach. 
#### Whenever hill climbing gets stuck at a local minimum, a new initial state is generated and hill climbing 
#### is recalled until a solution is found.
#EightQueenGameSolver.restarting_hill_climbing([0,0,0,0,0,0,0,0])


#### Using simulated annealing
EightQueenGameSolver.simulated_annealing([0,0,0,0,0,0,0,0])



                              