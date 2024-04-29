/*
 ** Class Name: IFT 210
 ** Author: Brandon Trinkle
 ** Date Created: 2/20/2024
 ** Purpose: Final Course Project
 */

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.*;
import java.util.Map.Entry;
import java.util.Scanner;

public class PortfolioManager
{

    private ArrayList<TransactionHistory> portfolioList = new ArrayList<>();
    private double cashBalance = 0.0; // Initial cash balance

    public static void main(String[] args)
    {
        PortfolioManager portfolioManager = new PortfolioManager();
        Scanner scnr = new Scanner(System.in);
        while (true)
        {
            try
            {
                System.out.println("\nBrandon Trinkle Brokerage Account");
                System.out.println("========================================");
                System.out.println("0 - Exit");
                System.out.println("1 - Deposit Cash");
                System.out.println("2 - Withdraw Cash");
                System.out.println("3 - Buy Stock");
                System.out.println("4 - Sell Stock");
                System.out.println("5 - Display Transaction History");
                System.out.println("6 - Display Portfolio");
                System.out.print("\nEnter option (0 to 6): ");

                int option = scnr.nextInt();
                scnr.nextLine(); // Consume the newline character

                switch (option)
                {
                    case 0 ->
                    {
                        System.out.println("Exiting the program. Goodbye!");
                        System.exit(0);
                    }
                    case 1 ->
                        portfolioManager.depositCash(scnr);
                    case 2 ->
                        portfolioManager.withdrawCash(scnr);
                    case 3 ->
                        portfolioManager.buyStock(scnr);
                    case 4 ->
                        portfolioManager.sellStock(scnr);
                    case 5 ->
                        portfolioManager.displayTransactionHistory();
                    case 6 ->
                        portfolioManager.displayPortfolio();
                    default ->
                        System.out.println("Invalid option. Please enter a valid option.");
                }
            } catch (java.util.InputMismatchException e)
            {
                System.out.println("Invalid input. Please enter a valid option.");
                scnr.nextLine(); // Consume the invalid input
            } catch (Exception e)
            {
                System.out.println("An unexpected error occurred: " + e.getMessage());
            }
        }
    }

    private void depositCash(Scanner scnr)
    {
        System.out.print("Enter the amount to deposit: $");
        double amount = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character
        System.out.print("Enter the transaction date (MM/dd/yyyy): ");
        String transDate = scnr.nextLine();

        cashBalance += amount;
        portfolioList.add(new TransactionHistory("CASH", transDate, "DEPOSIT", amount, 1.00));
        System.out.println("Cash deposited successfully.");
    }

    private void withdrawCash(Scanner scnr)
    {
        System.out.print("Enter the amount to withdraw: $");
        double amount = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character
        System.out.print("Enter the transaction date (MM/dd/yyyy): ");
        String transDate = scnr.nextLine();

        if (amount > cashBalance)
        {
            System.out.println("Error: Insufficient funds. Withdrawal amount cannot be more than available cash.");
        } else
        {
            cashBalance -= amount;
            portfolioList.add(new TransactionHistory("CASH", transDate, "WITHDRAW", -amount, 1.00));
            System.out.println("Cash withdrawn successfully.");
        }
    }

    private void buyStock(Scanner scnr)
    {
        System.out.print("Enter the stock ticker: ");
        String ticker = capitalizeTicker(scnr.nextLine());

        System.out.print("Enter the quantity to buy: ");
        double quantity = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character

        System.out.print("Enter the cost per share: $");
        double costPerShare = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character

        System.out.print("Enter the transaction date (MM/dd/yyyy): ");
        String transDate = scnr.nextLine();//Consume the newline character

        double totalCost = quantity * costPerShare;

        if (totalCost > cashBalance)
        {
            System.out.println("Error: Insufficient funds. You don't have enough cash to make this purchase.");
        } else
        {
            cashBalance -= totalCost;
            portfolioList.add(new TransactionHistory(ticker, transDate, "BUY", quantity, costPerShare));
            portfolioList.add(new TransactionHistory("CASH", transDate, "WITHDRAW", -totalCost, 1.00));
            System.out.println("Stock purchased successfully.");
        }
    }

    private String capitalizeTicker(String ticker)
    {
        return ticker.toUpperCase();
    }

    private void sellStock(Scanner scnr)
    {
        System.out.print("Enter the stock ticker: ");
        String ticker = capitalizeTicker(scnr.nextLine());

        System.out.print("Enter the quantity to sell: ");
        double quantityToSell = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character

        System.out.print("Enter the selling price per share: $");
        double sellingPrice = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character

        System.out.print("Enter the transaction date (MM/dd/yyyy): ");
        String transDate = scnr.nextLine();

        // Find the total quantity of the specified stock in the portfolio
        double totalStockQuantity = 0.0;
        for (TransactionHistory transaction : portfolioList)
        {
            if (transaction.getTicker().equals(ticker))
            {
                totalStockQuantity += transaction.getQty();
            }
        }

        if (quantityToSell > totalStockQuantity)
        {
            System.out.println("Error: Insufficient stocks. You don't have enough stocks to sell.");
        } else
        {
            double totalEarnings = quantityToSell * sellingPrice;
            cashBalance += totalEarnings;
            portfolioList.add(new TransactionHistory(ticker, transDate, "SELL", -quantityToSell, sellingPrice));
            portfolioList.add(new TransactionHistory("CASH", transDate, "DEPOSIT", totalEarnings, 1.00));
            System.out.println("Stock sold successfully.");
        }
    }

    private void displayTransactionHistory()
    {
        String fullName = "Brandon Trinkle";

        int tableWidth = 40; // Adjust this value based on your desired width
        int headerSpace = (tableWidth - fullName.length()) / 2; // Calculate space needed for centering

        System.out.printf("\n%" + headerSpace + "s%s %s Brokerage Account\n", "", fullName, "");
        System.out.println("            ==================================");
        System.out.printf("%-11s%-12s%-15s%-15s%-10s\n", "Date", "Ticker", "Quantity", "Cost Basis", "Trans Type");
        System.out.println("===============================================================");

        for (TransactionHistory transaction : portfolioList)
        {
            // Replace "$" with an empty string in the "Trans Type" column
            String transTypeWithoutDollarSign = transaction.getTransType().replace("$", "");
            String costBasisWithDollarSign = "$" + String.format("%.2f", transaction.getCostBasis());

            System.out.printf("%-13s%-8s%10.0f%17s%15s\n",
                    transaction.getTransDate(), transaction.getTicker(), transaction.getQty(),
                    costBasisWithDollarSign, transTypeWithoutDollarSign);
        }
    }

    private void displayPortfolio()
    {
        System.out.printf("Portfolio as of: %s\n", getCurrentDateAndTime());
        System.out.println(new String(new char[34]).replace('\0', '='));

        System.out.printf("%-8s%-8s\n", "Ticker", "Quantity");
        System.out.println("================");

        // Display remaining cash first
        System.out.printf("%-8s%-8.2f\n", "CASH", cashBalance);

        // Map to store net quantity of each stock
        HashMap<String, Double> stockQuantityMap = new HashMap<>();

        // Process transactions to calculate net quantity for each stock
        for (TransactionHistory transaction : portfolioList)
        {
            String ticker = transaction.getTicker();
            double quantity = transaction.getQty();

            // Update the net quantity in the map
            stockQuantityMap.put(ticker, stockQuantityMap.getOrDefault(ticker, 0.0) + quantity);
        }

        // Sort the entries by quantity from most to least
        List<Entry<String, Double>> sortedEntries = new ArrayList<>(stockQuantityMap.entrySet());
        sortedEntries.sort((entry1, entry2) -> Double.compare(entry2.getValue(), entry1.getValue()));

        // Display sorted net quantity for each stock
        for (Entry<String, Double> entry : sortedEntries)
        {
            String ticker = entry.getKey();
            double netQuantity = entry.getValue();

            // Skip displaying cash in the loop
            if (ticker.equals("CASH"))
            {
                continue;
            }

            // Display only if the net quantity is not zero
            if (netQuantity != 0)
            {
                System.out.printf("%-8s%-8.0f\n", ticker, netQuantity);
            }
        }
    }

    private String getCurrentDateAndTime()
    {
        // Use SimpleDateFormat to get the current date and time in the specified format
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
        return dateFormat.format(new Date());
    }
}
