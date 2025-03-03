import java.util.Scanner;

public class Hello {
    public static void main(String [] args){
        final int NUM_ELEMENTS = 3;
        int [] userVals = new int[NUM_ELEMENTS];
        int i;
     
        userVals[0] = 1;
        userVals[1] = 5;
        userVals[2] = 9;
  
        userVals[0] = userVals[2];
        userVals[2] = userVals[1];
     
        for (i = 0; i < userVals.length; ++i) {
           System.out.println(userVals[i]);
        }
     }
  }
