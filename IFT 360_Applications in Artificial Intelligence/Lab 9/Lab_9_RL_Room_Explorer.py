# -*- coding: utf-8 -*-
"""
Created on Wed Sep 21 12:20:43 2022

@author: aelbadra
"""

from random import shuffle

class Room:
    def __init__(self, x=5):
        self.nrows = x
        self.ncols = x
        return
    
    
class RoomExplorer:
    def __init__(self, r):
        #initialize the room dimensions
        self.room = r
        #initialize the total cost
        self.cost = 0
        #initialize the number of visited cells
        self.visited = 0
        #initialize the policy
        self.policy = []
        for i in range(r.nrows):
            a=[]
            for j in range(r.ncols):
                a.append(-1)
            self.policy.append(a)
        return
    
    
    #explore a room and build a policy based on returned reward/punishment
    #new cell reward = 1
    #old cell reward = -1
    #bump into wall reward = -1
    def explore_room(self):
        #intial position = [0,0]
        x_p = 0
        y_p = 0
        
        total_reward = 1
        moves = {0:"∧", 1:"∨", 2:">", 3:"<", -1:"X"}
        
        while True:
            
            #get next move
            (move, reward) = self.get_next_move(x_p, y_p)
            print(x_p, y_p, ":", moves[move])
            
            #update policy and total reward
            self.policy[x_p][y_p] = move
            total_reward += reward
            
            #implement the move
            if move == 0: # up
                y_p += 1
            elif move == 1: #down
                y_p -= 1
            elif move == 2: #right
                x_p += 1
            elif move == 3: #left
                x_p -= 1
                
            #check for termination condition, if true, print policy & return total reward
            missing_moves=0
            for i in range(self.room.nrows):
                for j in range(self.room.ncols):
                   if  self.policy[i][j] == -1:
                       missing_moves += 1
                       
            if missing_moves == 1:
                print("Total Reward =", total_reward)
                print("Policy Learned:")
                for j in range(self.room.ncols-1,-1,-1):
                    for i in range(self.room.nrows):
                        print(moves[ self.policy[i][j]], end="\t")
                    print()
                return total_reward
            
        
    #get the next move to implement based on returned reward/punishment
    def get_next_move(self, x_p, y_p):
        #generate random move
        rand_move = [0,1,2,3]
        shuffle(rand_move)
        #print("Shuffled moves:", rand_move)
        
        bad_mvs_to_old_cells = []
        
        reward = -1
        move = -1
        for mv in rand_move:
            #calculate reward/punishment based on the reward of the reached cell     
            if mv == 0: #go up
                if y_p + 1 >= self.room.nrows: #if bumping into wall
                    reward = -1
                elif self.policy[x_p][y_p+1] >= 0: #if old cell
                    reward = -1
                    bad_mvs_to_old_cells.append(mv)
                elif self.policy[x_p][y_p+1] == -1: #if new cell
                    reward = 1
                    move = mv
                    break
            elif mv == 1: #go down
                if y_p - 1 <0: #if bumping into wall
                    reward = -1
                elif self.policy[x_p][y_p-1] >= 0: #if old cell
                    reward = -1
                    bad_mvs_to_old_cells.append(mv)
                elif self.policy[x_p][y_p-1] == -1: #if new cell
                    reward = 1
                    move = mv
                    break
            #calculate reward/punishment based on the reward of the reached cell     
            elif mv == 2: #go right
                if x_p + 1 >= self.room.ncols: #if bumping into wall
                    reward = -1
                elif self.policy[x_p+1][y_p] >= 0: #if old cell
                    reward = -1
                    bad_mvs_to_old_cells.append(mv)
                elif self.policy[x_p+1][y_p] == -1: #if new cell
                    reward = 0
                    move = mv
                    break
            elif mv == 3: #go left
                if x_p - 1 <0: #if bumping into wall
                    reward = -1
                elif self.policy[x_p-1][y_p] >= 0: #if old cell
                    reward = -1
                    bad_mvs_to_old_cells.append(mv)
                elif self.policy[x_p-1][y_p] == -1: #if new cell
                    reward = 0
                    move = mv
                    break
                    
        if move == -1: #all moves are bad
            move = bad_mvs_to_old_cells[0] #choose the move that will take you back to an old cell, don't choose a move that will bump you into a wall!
            reward = -1    
        
        return(move, reward)
        
#=========================================
#Main Code
'''
room = Room(4)
rx = RoomExplorer(room)
total_reward = rx.explore_room()
'''        

count = 0   
while True:
    count += 1
    room = Room(4)
    rx = RoomExplorer(room)
    total_reward = rx.explore_room()
    if(total_reward == 13):
        print("number of explorations performed to find optimal solution = ", count)
        break

