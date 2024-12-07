# -*- coding: utf-8 -*-
"""
Created on Mon Aug 15 21:23:08 2022

@author: aelbadra
"""
class Graph:
    
    def __init__(self):
        self.nodes = {}
        self.edges = {}

    #add a node to the graph
    def add_node(self,node_name):
        self.nodes[node_name]=1
        self.edges[node_name] = []
 
    #add a single direction edge from src => dst
    def add_dir_edge(self, src_node, dst_node, edge_wt):
        self.edges[src_node].append( (dst_node, edge_wt) )
        
    #add a bidirectional edge from dst => src
    def add_bidir_edge(self, src_node, dst_node, edge_wt):
         self.edges[src_node].append( (dst_node, edge_wt) )
         self.edges[dst_node].append( (src_node, edge_wt) )
         
    #expand a node and return its children list
    def expand_node(self, node):
        if node in self.edges:
            return self.edges[node]
        else:
            print('Node not in graph!')
            return None
#============================
#============================
