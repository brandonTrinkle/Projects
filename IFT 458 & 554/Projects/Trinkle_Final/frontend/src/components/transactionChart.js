import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TransactionChart = ({ transactions }) => {
  const data = transactions.map(tx => ({
    date: tx.date.slice(0,10),
    balance: tx.type === 'income' ? tx.amount : -tx.amount,
  })).reduce((acc, curr) => {
    const lastBalance = acc.length ? acc[acc.length - 1].balance : 0;
    acc.push({ date: curr.date, balance: lastBalance + curr.balance });
    return acc;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionChart;
