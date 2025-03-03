# -*- coding: utf-8 -*-
"""
Created on Wed Aug 17 16:55:10 2022

@author: aelbadra
"""
# -*- coding: utf-8 -*-
"""
Created on Mon Aug 15 22:15:21 2022

@author: aelbadra

"""
import copy


#=============================================
#A tile state holds the locations of all tiles and the empty location
class TileState:
    #define a new Tile state given the locations of the tiles
    def __init__(self, s, i,j):
        self.state = s
        self.x = i
        self.y = j
        self.set_state_name()
        
    def set_state_with_name(self, s_name):
        self.state=[]
        #print("inside set state with name. State = \n****\n", s_name)
        #set state
        lines = s_name.split('\n')
        lines.pop() #remove last line as it is empty.
        for line in lines:
            lst=[]
            ns = line.split(',')
            for i in range(3):
                lst.append(int(ns[i]))
            self.state.append(lst)
        #set location of empty tile
        for i in range(3):
            for j in range(3):
                if self.state[i][j]==-1:
                    self.x=i
                    self.y=j
                    break
        
    #the state name shows the tile locations as a string
    def set_state_name(self):
        if self.state is None:
            self.state_name='None'
            #print('Can\'t set state name. State is None!')
            return
        name = ''
        s = self.state
        for i in range(0,len(s)):
            for j in range(0,len(s)):
                name = name + str(s[i][j]) + ','
            name = name+'\n'
        self.state_name = name
    

#=============================================
#=============================================
#=============================================

#create a tile problem class to hold all information about the tile problem
class TileProblem:
    
    #istate is an object of tyle TileState
    def __init__(self, istate):
        self.initial_state = istate
        self.n_tiles = 3
        #ideal locations of tiles:
        self.goal_loc = []
        self.goal_loc.append( (0,0) ) #empty tile at 0,0
        #1 => 0,1
        self.goal_loc.append((0,1))
        # 2 => 0,2
        self.goal_loc.append((0,2))
        # 3 => 1,0
        self.goal_loc.append((1,0))
        # 4 => 1,1
        self.goal_loc.append((1,1))
        # 5 => 1,2
        self.goal_loc.append((1,2))
        # 6 => 2,0
        self.goal_loc.append((2,0))
        # 7 => 2,1
        self.goal_loc.append((2,1))
        # 8 => 2,2
        self.goal_loc.append((2,2))
        
    #tstate is an object of type TileState
    def expand_state(self, tstate):
        x = tstate.x
        y = tstate.y
        nbr_states = []
        
        #move right
        if x>0:
            rt_mv_s = copy.deepcopy(tstate.state)
            rt_mv_s[x][y] = rt_mv_s[x-1][y] # move tile right
            rt_mv_s[x-1][y] = -1 # set new empty tile
            ts = TileState(rt_mv_s, x-1, y) #create new tilestate
            nbr_states.append(ts) #append new tilestate to neighbors
        #move left
        if x<self.n_tiles-1:
            lt_mv_s = copy.deepcopy(tstate.state)
            lt_mv_s[x][y] = lt_mv_s[x+1][y] # move tile left
            lt_mv_s[x+1][y] = -1 # set new empty tile
            ts = TileState(lt_mv_s, x+1, y) #create new tilestate
            nbr_states.append(ts) #append new tilestate to neighbors
        #move down
        if y>0:
            dn_mv_s = copy.deepcopy(tstate.state)
            dn_mv_s[x][y] = dn_mv_s[x][y-1] # move tile down
            dn_mv_s[x][y-1] = -1 # set new empty tile
            ts = TileState(dn_mv_s, x, y-1) #create new tilestate
            nbr_states.append(ts) #append new tilestate to neighbors
        #move up
        if y<self.n_tiles-1:
            up_mv_s = copy.deepcopy(tstate.state)
            up_mv_s[x][y] = up_mv_s[x][y+1] # move tile up
            up_mv_s[x][y+1] = -1 # set new empty tile
            ts = TileState(up_mv_s, x, y+1) #create new tilestate
            nbr_states.append(ts) #append new tilestate to neighbors
        
        return nbr_states

    #get the cost of a state by adding distances of tiles to their goal states
    def get_state_cost(self,tstate):
        locs = tstate.state
        sum_dist = 0
        for i in range(0,self.n_tiles):
            for j in range(0,self.n_tiles):
                
                num = locs[i][j]
                if num == -1:
                    continue
                (i_goal, j_goal) = self.goal_loc[num]
                sum_dist += abs(i_goal-i) + abs(j_goal-j)
        return sum_dist
    
    def is_goal_state(self, tstate):
        sum_dist = self.get_state_cost(tstate)
        if sum_dist == 0:
            return True
        else:
            return False
        
#=============================================
#=============================================
#=============================================

