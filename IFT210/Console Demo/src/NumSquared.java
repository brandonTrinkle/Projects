/*
 * Class name: IFT210
 * Author: Brandon Trinkle
 * Date created: 1/13/2024
 * Purpose: Proof of IDE installed
 */
import java.util.Scanner;

public class NumSquared {
   public static void main(String[] args) {
      Scanner scnr = new Scanner(System.in);
      int userNum;
      int userNumSquared;
      
      userNum = scnr.nextInt();
      
      userNumSquared = userNum * userNum;   // Bug here; fix it when instructed
      
      System.out.print(userNumSquared);   // Output formatting issue here; fix it when instructed
   }
}