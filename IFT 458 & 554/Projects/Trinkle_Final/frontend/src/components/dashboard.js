import React, { useEffect, useState } from 'react';
import api from '../api';
import TransactionChart from './TransactionChart';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('income');

  const fetchTransactions = async () => {
    const res = await api.get('/transactions', {
      headers: { Authorization: localStorage.getItem('token') },
    });
    setTransactions(res.data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    await api.post('/transactions', { amount, category, type }, {
      headers: { Authorization: localStorage.getItem('token') },
    });
    fetchTransactions();
  };

  const calculateBalance = () => {
    return transactions.reduce((acc, item) => {
      return item.type === 'income' ? acc + item.amount : acc - item.amount;
    }, 0);
  };

  return (
    <div>
      <h2>Your Transactions</h2>
      <h3>Available Funds: ${calculateBalance()}</h3>

      <form onSubmit={handleAddTransaction}>
        <input type="number" placeholder="Amount" required onChange={(e) => setAmount(e.target.value)} />
        <input placeholder="Category" required onChange={(e) => setCategory(e.target.value)} />
        <select onChange={(e) => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button type="submit">Add Transaction</button>
      </form>

      <TransactionChart transactions={transactions} />

      <ul>
        {transactions.map(tx => (
          <li key={tx._id}>
            {tx.date.slice(0,10)} | {tx.category} | ${tx.amount} | {tx.type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
