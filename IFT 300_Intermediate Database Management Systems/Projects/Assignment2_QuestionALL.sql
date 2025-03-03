/*
** Author: Brandon Trinkle
** Course: IFT/300
** SQL Server Version: Microsoft SQL Server 2012 (SP1) 

** OS : Windows
** History
** Date Created    Comments
** 10/28/2024      Question 1
*/
-- 1. Retrieve Vendor Contact First and Last Names, and Vendor Name, sorted by last and first name.
SELECT 
    VendorContactFName, 
    VendorContactLName, 
    VendorName
FROM 
    Vendors
ORDER BY 
    VendorContactLName, 
    VendorContactFName;


-- 2. Retrieve Invoice Details with Aliases for Number, Total, Credits, and Balance.
SELECT 
    InvoiceNumber AS Number, 
    InvoiceTotal AS Total, 
    (PaymentTotal + CreditTotal) AS Credits, 
    (InvoiceTotal - (PaymentTotal + CreditTotal)) AS Balance
FROM 
    Invoices;


-- 3. Concatenate Vendor Contact First and Last Names as Full Name, sorted by last and first name.
SELECT 
    CONCAT(VendorContactLName, ', ', VendorContactFName) AS FullName
FROM 
    Vendors
ORDER BY 
    VendorContactLName, 
    VendorContactFName;


-- 4. Retrieve InvoiceTotal, 10% of InvoiceTotal, and InvoiceTotal plus 10% for rows with a balance due > 1000, sorted by InvoiceTotal descending.
SELECT 
    InvoiceTotal, 
    (InvoiceTotal * 0.1) AS "10%", 
    (InvoiceTotal * 1.1) AS "Plus 10%"
FROM 
    Invoices
WHERE 
    InvoiceTotal - (PaymentTotal + CreditTotal) > 1000
ORDER BY 
    InvoiceTotal DESC;