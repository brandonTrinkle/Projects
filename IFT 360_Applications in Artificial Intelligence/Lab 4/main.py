# -*- coding: utf-8 -*-
"""
Created on Wed Aug 17 20:31:16 2022

@author: aelbadra
"""
from graph_traverser import GraphTraverser
from tile_search_problem import TileState, TileProblem


#create a TileProblem

ts = TileState(
    [ 
     [7,  2, 4], 
     [5, -1, 6], 
     [8,  3, 1]
     ], 
    1,1
    )


tp = TileProblem(ts)

gt = GraphTraverser(None)

gt.greedy_best_first_search(tp)
