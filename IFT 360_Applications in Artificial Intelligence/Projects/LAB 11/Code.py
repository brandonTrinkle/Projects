# -*- coding: utf-8 -*-
"""
Created on Sun Oct  6 10:23:53 2024

Author: Brandon Trinkle
Class IFT 360

"""

import string
import re

fp = open('C://Users//Btrin//OneDrive//Desktop//IFT 360//LAB 11//text_only.csv', 'r')

clean_text = []
for line in fp: 
    #remove 's
    line = line.replace(' \'s', '')
    
    #string.punctuation contains all special characters.
    #this for loop removes all special characters
    for i in string.punctuation:
        line = line.replace(i,'')
        
    #removing special characters results in some extra white spaces.
    #replace mutliple white spaces with a single white space
    #use a regular expression (re) to define the multiple space pattern
    line = re.sub(' +', ' ', line)
    
    #remove the last two characters of the line which are: white space, new line break
    line = line[:-2]
    
    #convert into all lower-case letters
    line = line.lower()

    #add line to cleaned data
    clean_text.append(line)
    
    unigrams = {}
    bigrams  = {}
    trigrams = {}
    
    unigram_cnts = {}
    bigram_cnts  = {}
    trigram_cnts = {}
    
    #word suggestion indices
    one_wrd_sug = {}
    two_wrd_sug = {}
    
for t in clean_text:
    #split the words in each sentence
    words = [i for i in t.split(' ')]
    
    #add single words to list of unigrams
    for w in words:
        unigrams[w] = 0
        unigram_cnts[w] = unigram_cnts.get(w,0)+1
    
    #add every two successive words to the list of bigrams
    bi = zip( words[:-1] , words[1:] )
    for b in bi:
        x=' '.join(b)
        bigrams[x] = 0
        bigram_cnts[x] = bigram_cnts.get(x, 0)+1
        #add entry to one word suggestion list
        if bigram_cnts[x]==1:
            if b[0] in one_wrd_sug:
                (one_wrd_sug[b[0]]).append(x)
            else:
                one_wrd_sug[b[0]] = [x]
                

    #add every three successive words to the list of trigrams        
    tri = zip( words[:-2] , words[1:-1], words[2:]  )
    for t in tri:
        x = ' '.join(t)
        trigrams[x] = 0
        trigram_cnts[x] = trigram_cnts.get(x, 0)+1
        #add entry to two-word suggestion list
        if trigram_cnts[x]==1:
            k= t[0]+" "+t[1]
            if k in two_wrd_sug:
                (two_wrd_sug[k]).append(x)
            else:
                two_wrd_sug[k] = [x]
                #print some sample words for which a suggestion can be made
                two_wrds=['goldman sachs', 'similar to', 'deal includes', 
                          'private equity', 'china and', 'the longterm', 'kind of']
                print("These are some of the two-word phrases that the agent can suggest a word after:")
                for i in two_wrds:
                    print(i)
                    print("==================================")

            one_wrd = ['longer', 'identity', 'know', 'protocol', 
           'realtime', 'motorola', 'highquality', 'defense']
            print("These are some of the one-word phrases that the agent can suggest a word after:")
            for i in one_wrd:
                print(i)
                print("==================================")
                #ask the user to enter a word, output a couple of suggestions
                wrd = input('enter one word to give you a suggestion for the following word: ')
                if wrd in one_wrd_sug:
                    print('Suggestions:')
                    for i in one_wrd_sug[wrd]:
                        print(i)
                        
        #ask the user to enter two words, output a couple of suggestions
        wrd = input('enter two words to give you a suggestion for the following word: ')
        if wrd in two_wrd_sug:
            print('Suggestions:')
            for i in two_wrd_sug[wrd]:
                print(i)