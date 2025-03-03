# -*- coding: utf-8 -*-
"""
Created on Wed Aug 17 11:12:20 2022

@author: aelbadra
"""

from graph import Graph
from graph_traverser import GraphTraverser

# Main

# Construct Graph for the cities of Romania.
g = Graph()
g.add_node('Arad')
g.add_node('Zerind')
g.add_node('Oradea')
g.add_node('Sibiu')
g.add_node('Fagaras')
g.add_node('Bucharest')
g.add_node('Timisoara')
g.add_node('Lugoj')
g.add_node('Mehadia')
g.add_node('Drobeta')
g.add_node('Craiova')
g.add_node('Rimnicu Vilcea')
g.add_node('Pitesti')

# Add edges to graph 
g.add_bidir_edge('Arad','Zerind',75)
g.add_bidir_edge('Arad','Sibiu',140)
g.add_bidir_edge('Arad','Timisoara',118)
g.add_bidir_edge('Timisoara','Lugoj',111)
g.add_bidir_edge('Lugoj','Mehadia',70)
g.add_bidir_edge('Mehadia','Drobeta', 75)
g.add_bidir_edge('Drobeta','Craiova',120)
g.add_bidir_edge('Craiova','Pitesti',138)
g.add_bidir_edge('Pitesti','Bucharest',101)
g.add_bidir_edge('Pitesti','Rimnicu Vilcea',97)
g.add_bidir_edge('Craiova','Rimnicu Vilcea',146)
g.add_bidir_edge('Oradea','Zerind',71)
g.add_bidir_edge('Oradea','Sibiu',151)
g.add_bidir_edge('Sibiu','Fagaras',99)
g.add_bidir_edge('Sibiu','Rimnicu Vilcea',80)
g.add_bidir_edge('Fagaras','Bucharest',211)


# Perform breadth-first search to find the path from Arad ==> Bucharest
gt = GraphTraverser(g)
gt.breadth_first_traversal('Arad', 'Bucharest')
print("")#Adding break between breadth-first search and depth-first search

# Depth-first traversal from Arad to Bucharest
# Brandon Trinkle
# IFT 360
print("Running Depth-First Traversal:")
gt.depth_first_traversal('Arad', 'Bucharest')
