
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
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
                case 0:
                    System.out.println("Exiting the program. Goodbye!");
                    System.exit(0);
                    break;
                case 1:
                    portfolioManager.depositCash(scnr);
                    break;
                case 2:
                    portfolioManager.withdrawCash(scnr);
                    break;
                case 3:
                    portfolioManager.buyStock(scnr);
                    break;
                case 4:
                    portfolioManager.sellStock(scnr);
                    break;
                case 5:
                    portfolioManager.displayTransactionHistory();
                    break;
                case 6:
                    portfolioManager.displayPortfolio();
                    break;
                default:
                    System.out.println("Invalid option. Please enter a valid option.");
            }
        }
    }

    private void depositCash(Scanner scnr)
    {
        System.out.print("Enter the amount to deposit: $");
        double amount = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character

        cashBalance += amount;
        portfolioList.add(new TransactionHistory("CASH", getCurrentDate(), "DEPOSIT", amount, 1.00));
        System.out.println("Cash deposited successfully.");
    }

    private void withdrawCash(Scanner scnr)
    {
        System.out.print("Enter the amount to withdraw: $");
        double amount = scnr.nextDouble();
        scnr.nextLine(); // Consume the newline character

        if (amount > cashBalance)
        {
            System.out.println("Error: Insufficient funds. Withdrawal amount cannot be more than available cash.");
        } else
        {
            cashBalance -= amount;
            portfolioList.add(new TransactionHistory("CASH", getCurrentDate(), "WITHDRAW", -amount, 1.00));
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

        double totalCost = quantity * costPerShare;

        if (totalCost > cashBalance)
        {
            System.out.println("Error: Insufficient funds. You don't have enough cash to make this purchase.");
        } else
        {
            cashBalance -= totalCost;
            portfolioList.add(new TransactionHistory(ticker, getCurrentDate(), "BUY", quantity, costPerShare));
            portfolioList.add(new TransactionHistory("CASH", getCurrentDate(), "WITHDRAW", -totalCost, 1.00));
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
            portfolioList.add(new TransactionHistory(ticker, getCurrentDate(), "SELL", -quantityToSell, sellingPrice));
            portfolioList.add(new TransactionHistory("CASH", getCurrentDate(), "DEPOSIT", totalEarnings, 1.00));
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
        System.out.printf("%-12s%-8s%-15s%-15s%-10s\n", "Date", "Ticker", "Quantity", "Cost Basis", "Trans Type");
        System.out.println("==================================================================");

        for (TransactionHistory transaction : portfolioList)
        {
            System.out.printf("%-12s%-8s%-15.2f$%-14.2f$%-10s\n",
                    transaction.getTransDate(), transaction.getTicker(), transaction.getQty(),
                    transaction.getCostBasis(), transaction.getTransType());
        }
    }

    private void displayPortfolio()
    {
        System.out.printf("Portfolio as of: %s\n", getCurrentDateAndTime());
        System.out.println(new String(new char[34]).replace('\0', '='));

        System.out.printf("%-8s%-8s\n", "Ticker", "Quantity");
        System.out.println("================");

        for (TransactionHistory transaction : portfolioList)
        {
            if (!transaction.getTicker().equals("CASH"))
            {
                System.out.printf("%-8s%-8.2f\n", transaction.getTicker(), transaction.getQty());
            }
        }
    }

    private String getCurrentDate()
    {
        // Use SimpleDateFormat to get the current date in the specified format
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
        return dateFormat.format(new Date());
    }

    private String getCurrentDateAndTime()
    {
        // Use SimpleDateFormat to get the current date and time in the specified format
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
        return dateFormat.format(new Date());
    }
}
