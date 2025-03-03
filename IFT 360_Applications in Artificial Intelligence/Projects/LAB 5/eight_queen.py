# -*- coding: utf-8 -*-
"""
Created on Fri Aug 26 10:06:03 2022

@author: aelbadra
"""

#QUEENS have indices 0-7
#QUEEN POSITIONS are indicated as (x,y) coordinates in the range [0,7]

import random

class EightQueenGame:
    def __init__(self, p):
        self.positions = p
        return
    
    #find how many attacks are in a given setting
    #p is a list of size 8 holding the 8 queens positions from row 0 to row 7
    def get_num_attacks(p):
        nattacks = 0
        for i in range(0,8):
            for j in range(i+1,8):
                i_x = i
                j_x = j
                i_y = p[i]
                j_y = p[j]
                if (i_x == j_x) or (i_y == j_y) or ( abs(i_x-j_x) == abs(i_y-j_y) ):
                    nattacks += 1
                    
        return nattacks
    
    #set the position of one queen
    def set_position(self, queen, p):
        self.positions[queen] = p
        return
    
    #set the positions of all queens
    def set_positions(self, p):
        self.positions = p
        return
    
    #for a given position, find all neighboring positions that can be  
    #obtained by moving one queen to any location along its column.
    def extend_position(p):
        extended_positions=[]
        for col in range(8):
            for row in range(8):
                if row != p[col]:
                    new_p = p[:]
                    new_p[col]=row
                    extended_positions.append(new_p)
        return extended_positions
    

#Class that contains different methods for solving an 8-queen problem:
# - Brute Force Method
# - Hill Climbing
# - Repeating Hill Climbing
# - Simulated Annealing
class EightQueenGameSolver:
    def __init__(self):
        return

    #brute-force method tries out all positions until a solution is found
    #eight nested for loops are used to loop over the positions of the 8 queens
    def brute_force_solution():
        positions = [0,0,0,0,0,0,0,0]
        for i in range(0,8):
            for j in range(0,8):
                for k in range(0,8):
                    for l in range(0,8):
                        for m in range(0,8):
                            for n in range(0,8):
                                for o in range(0,8):
                                    for p in range(0,8):
                                        positions = [i,j,k,l,m,n,o,p]
                                        a = EightQueenGame.get_num_attacks(positions)
                                        print(a, ":", positions)
                                        if a == 0:
                                            print("Solution Found:", positions)
                                            return
    
    #instead of writing 8 nested for loops for brute force solution,
    #we can use the itertools package to write more compact code for nested
    #for loops.
    def brute_force_solution_2():
        import itertools
        for i,j,k,l,m,n,o,p in itertools.product(range(8), range(8), range(8), range(8), range(8), range(8), range(8), range(8)):
            positions = [i,j,k,l,m,n,o,p]
            a = EightQueenGame.get_num_attacks(positions)
            print(a, ":", positions)
            if a == 0:
                print("Solution Found:", positions)
                break
            
    #hill climbing method
    def hill_climbing(initial_position):
            #check if initial position is a solution!
            old_p = initial_position[:]
            old_n_attacks = EightQueenGame.get_num_attacks(initial_position)
            if old_n_attacks == 0:
                print("Initial State is a solution!", initial_position)
                return True
            
            while True:
                #extend current position by checking all neighboring positions
                new_positions = EightQueenGame.extend_position(old_p)
                new_n_attacks = []
                #get number of attacks for each neighboring position
                for i in range(len(new_positions)):
                    n = EightQueenGame.get_num_attacks(new_positions[i])
                    new_n_attacks.append(n)
                
            
                #get index of the neighboring position min # attacks
                min_attacks = min(new_n_attacks)
                new_p_indx = new_n_attacks.index(min_attacks)
                
                #check if that is a solution
                if min_attacks == 0:
                    print("Solution found:", new_positions[new_p_indx])
                    return True
                
                #if no neighboring position has a lower number of attacks, hill climbing gets stuck!
                if old_n_attacks<=min_attacks:
                    print("Hill Climbing Reached a Local Minimum at Position:",
                          new_positions[new_p_indx])
                    return False
                
                #update current position in case new position has less number of attacks
                if old_n_attacks>min_attacks:
                    old_p = (new_positions[new_p_indx])[:]
                    old_n_attacks = EightQueenGame.get_num_attacks(old_p)
                    print(old_n_attacks, old_p)
                    
                    
    #same like hill climbing, except that each time hill climbing gets stuck, 
    #it is restarted with a different initial state until a solution is found.
    def restarting_hill_climbing(initial_position):
        count=0
        found = EightQueenGameSolver.hill_climbing(initial_position)
        if found:
            return
        while not found:
            count +=1
            #generate a new initial state
            new_p = [random.randrange(8) for i in range(8)]
            #re-call the hill climibing method
            found = EightQueenGameSolver.hill_climbing(new_p)
        print("Number of Hill Climbing restarts = ", count)
        return
        
    
    #simulated annealing is very similar to hill climbing. Only difference is that when we
    #cannot find any neighboring positions with a lower number of attacks than the current
    #position, then we can 
    def simulated_annealing(initial_position):
        #check if initial position is a solution!
        old_p = initial_position[:]
        old_n_attacks = EightQueenGame.get_num_attacks(initial_position)
        if old_n_attacks == 0:
            print("Initial State is a solution!", initial_position)
            return True
        
        T = 0.70
        
        while True:
            #extend current position by checking all neighboring positions
            new_positions = EightQueenGame.extend_position(old_p)
            new_n_attacks = []
            #get number of attacks for each neighboring position
            for i in range(len(new_positions)):
                n = EightQueenGame.get_num_attacks(new_positions[i])
                new_n_attacks.append(n)
                
            
            #get index of # attacks for some random neighbor
            new_p_indx = random.randrange(len(new_n_attacks))
            n_attacks = new_n_attacks[new_p_indx]

                
            #check if that is a solution
            if n_attacks == 0:
                print("Solution found:", new_positions[new_p_indx])
                return True
            
            #only accept worse positions with some probability T, then reduce T
            if old_n_attacks <= n_attacks:
                #roll a die
                d = random.random()
                if d < T:
                    old_p = (new_positions[new_p_indx])[:]
                    old_n_attacks = EightQueenGame.get_num_attacks(old_p)
                    if T > 0.1:
                        T -= 0.01
    ###############################################################################################################
    #Code Added below by Brandon Trinkle     
    #Date: 9/8/2024
    #Class: IFT 360
    #Professor Durgesh Sharma
    ###############################################################################################################
            # Update current position if the new position has fewer attacks or is accepted probabilistically
            if old_n_attacks > n_attacks:
                # Always accept better positions
                old_p = (new_positions[new_p_indx])[:]
                old_n_attacks = EightQueenGame.get_num_attacks(old_p)
                print(old_n_attacks, old_p)
            elif old_n_attacks <= n_attacks:
                # Accept worse positions with some probability T
                d = random.random()
                if d < T:
                    old_p = (new_positions[new_p_indx])[:]
                    old_n_attacks = EightQueenGame.get_num_attacks(old_p)
                    print(old_n_attacks, old_p)
                    if T > 0.1:
                        T -= 0.01

                print(old_n_attacks, old_p)
        return