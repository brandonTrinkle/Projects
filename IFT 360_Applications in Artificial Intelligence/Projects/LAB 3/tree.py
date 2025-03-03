# -*- coding: utf-8 -*-
"""
Created on Mon Aug 15 22:15:21 2022

@author: aelbadra
"""

class TreeNode:
    #set node name, list of children and parent name
    def __init__(self, node_name, parent_name):
        self.name = node_name
        self.parent = parent_name
        self.children = {}
        
    #add a child to the node's children dictionary
    def add_child(self, child_name, edge_cost):
        self.children[child_name] = edge_cost
        
    #set the parent name, p is of type string
    def set_parent(self, p):
        self.parent = p
        
    #remove a child from the node's children dictionary
    def remove_child(self, child_name):
        self.children.pop(child_name)
        
#=============================================
#=============================================
#=============================================

class Tree:
    
    def __init__(self):
        self.nodes = {}
        self.root_name  = ''

    #set the tree root node, 
    #r is an object of type TreeNode
    def set_root(self, r):
        self.root_name = r.name
        self.nodes[r.name] = r
        self.nodes[r.name].set_parent(None)
        
    #add a node to the tree. 
    #The parent must be known at the time of adding the node.
    #both node and parent records are linked with parent-child relationships to facilitate tree traversal later.
    #child_node is an object of type TreeNode
    #parent_node_name is a string
    def add_child_node(self, child_node, parent_node_name, edge_cost):
        self.nodes[child_node.name] = child_node
        self.nodes[child_node.name].set_parent(parent_node_name)
        self.nodes[parent_node_name].add_child(child_node.name, edge_cost)
        
        
    #print the path from the root to some node n
    #n is of type TreeNode
    def print_path(self, n):
        if n.name not in self.nodes:
            print("Node not found!")
            return
        path=[]
        cur_node_name = n.name
        while cur_node_name is not None:
            path.append(cur_node_name)
            cur_node_name = self.nodes[cur_node_name].parent
        
        path.reverse()
        print("Full Path: ", path)
        return
    
#=============================================
#=============================================
#=============================================

