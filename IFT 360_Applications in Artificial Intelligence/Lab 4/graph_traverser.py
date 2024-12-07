# -*- coding: utf-8 -*-
"""
Created on Mon Aug 15 22:50:58 2022

@author: aelbadra
"""
from tree import Tree, TreeNode
from tile_search_problem import TileState, TileProblem

#===========================================

class GraphTraverser:
    
    def __init__(self, g):
        self.graph = g
        self.tree = Tree()

    #===========================================
    
    #===========================================
           
    def a_star_traversal(self, tile_problem):
        #extract initial state
        initial_state = tile_problem.initial_state
        
        #check if initial state is the goal state
        if tile_problem.is_goal_state(initial_state):
            print("Initial state is goal state!")
            return
        
        #set data structures
        reached_states_cost_hn = {}
        reached_states_cost_gn = {}
        reached_states_cost_hn[initial_state.state_name] = tile_problem.get_state_cost(initial_state)
        reached_states_cost_gn[initial_state.state_name] = 0

        states_to_expand = {initial_state.state_name:1}
        
        #create the traversal tree
        self.tree = Tree()
        rootNode = TreeNode(initial_state.state_name, None)
        self.tree.set_root(rootNode)
        
        #expand initial state and append all states into the data structures
                
        #while loop: keep expanding states until a goal state is reached
        while len(states_to_expand)>0:
            #compute all state costs
            cost_fn={}
            for c_state in states_to_expand:
                cost_fn[c_state] = reached_states_cost_hn[c_state] + reached_states_cost_gn[c_state]
            
            #find min-cost state
            min_cost_state_name = min(cost_fn, key=cost_fn.get)
            
            #pop the min cost state from the states_to_expand list:
            states_to_expand.pop(min_cost_state_name)
            
            #create a state using the state name:
            exp_state = TileState(None, -1,-1)
            exp_state.set_state_with_name(min_cost_state_name)
            #print("state created for min-cost state:\n")
            #print(exp_state.state)
            #print(exp_state.x, exp_state.y)
            
            #check if goal state then return solution
            if tile_problem.is_goal_state(exp_state):
                print("Solution Found!: ", min_cost_state_name)
                self.tree.print_path(TreeNode(min_cost_state_name,''))
                break
            
            #expand all its neighboring states
            expanded_states = tile_problem.expand_state(exp_state)

            #find neighbors' costs and add to expansion & reach lists & the traversal tree
            for state in expanded_states:
                #check if state has been previously reached, in which case, don't re-add as this will lead to infinite loops
                if state.state_name not in reached_states_cost_hn:
                    reached_states_cost_hn[state.state_name] = tile_problem.get_state_cost(state)
                    reached_states_cost_gn[state.state_name] = reached_states_cost_gn[min_cost_state_name] + 1 # these states are 1 step away from the state being expanded now
                    states_to_expand[state.state_name]=1
                    #add node to traversal tree. all edge weights = 1 since each expanded state is one move away from its parent state
                    n = TreeNode(state.state_name, min_cost_state_name)
                    self.tree.add_child_node( n, min_cost_state_name, 1)

    #### GBF #####
    def greedy_best_first_search(self, tile_problem):
        # Extract initial state
        initial_state = tile_problem.initial_state

        # Check if initial state is the goal state
        if tile_problem.is_goal_state(initial_state):
            print("Initial state is goal state!")
            return

        # Set data structures
        reached_states_cost_hn = {}
        reached_states_cost_hn[initial_state.state_name] = tile_problem.get_state_cost(initial_state)

        states_to_expand = {initial_state.state_name: 1}

        # Create the traversal tree
        self.tree = Tree()
        rootNode = TreeNode(initial_state.state_name, None)
        self.tree.set_root(rootNode)

        # While loop: keep expanding states until a goal state is reached
        while len(states_to_expand) > 0:
            # Compute all state costs based on heuristic only (GBF)
            cost_hn = {c_state: reached_states_cost_hn[c_state] for c_state in states_to_expand}

            # Find min-cost state based on heuristic
            min_cost_state_name = min(cost_hn, key=cost_hn.get)
            
            # Debugging print statement: After computing costs
            print(f"Expanding state: {min_cost_state_name}")

            # Pop the min cost state from the states_to_expand list
            states_to_expand.pop(min_cost_state_name)

            # Create a state using the state name
            current_state = TileState([], 0, 0)  # Initialize a new TileState
            current_state.set_state_with_name(min_cost_state_name)  # Set state using the state name
            
            # Debugging print statement: Before checking if the goal is reached
            print(f"Current state being checked: {current_state.state}")

            # Check if the goal state is reached
            if tile_problem.is_goal_state(current_state):
                print("Goal state reached!")
                self.tree.print_path(self.tree.get_node(min_cost_state_name))
                return

            # Expand the current state
            expanded_states = tile_problem.expand_state(current_state)

            # Debugging print statement: Before adding new states
            print(f"Number of states to expand: {len(states_to_expand)}")

            # Add new states to the data structures
            for state in expanded_states:
                state_name = state.state_name
                if state_name not in reached_states_cost_hn:
                    reached_states_cost_hn[state_name] = tile_problem.get_state_cost(state)
                    states_to_expand[state_name] = 1
                    new_node = TreeNode(state_name, min_cost_state_name)
                    self.tree.add_child_node(new_node, min_cost_state_name, 1)

        print("No solution found with GBF.")

                
    #===========================================
                
            
#==================================================================
#==================================================================
#==================================================================
# Main
'''
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


gt = GraphTraverser(g)
print("Breadth First Search From Arad to Bucharest")
gt.breadth_first_traversal('Arad', 'Bucharest')

print("Depth First Search From Arad to Bucharest")
gt.depth_first_traversal('Arad', 'Bucharest')
'''