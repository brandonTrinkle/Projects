import math

painter1 = float(input('Hours for painter 1 to paint the room: ')) #Painter 1 hours
painter2 = float(input('House for painter 2 to paint hte room: ')) #Painter 2 hours
x = (painter1 * painter2) #Calculation to find common denominator
y = float((painter1 + painter2)) #Combined hours of work
z = (x / y) #complete formula of painter1/GCD + painter2/GCD = GCD/total hours to complete job


print('Time required if they worked togehter:' , f'{z:.2f}')

#in our sample it would be 4/8 + 2/8 = 6/8 = 8/6 = 1.33 total hours