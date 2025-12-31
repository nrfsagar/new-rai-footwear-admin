'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
  _id: string;
  user_id: string;
  user_email: string;
  amount: number;
  type: 'given' | 'taken';
  timestamp: string;
  note: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
}

const ADMIN_PASSWORD = "Mukul@0610";

export default function PaymentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'given' | 'taken'>('given');
  const [note, setNote] = useState('');
  const [timestamp, setTimestamp] = useState('');
  
  // Filter state
  const [filterEmail, setFilterEmail] = useState('');
  const FILTER_ALL_VALUE = '__ALL_USERS__';

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem('payments_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
      fetchUsers();
    }
  }, [isAuthenticated, filterEmail]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('payments_auth', 'true');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.devices) {
        setUsers(data.devices);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = '/api/payments';
      if (filterEmail) {
        url += `?user_email=${encodeURIComponent(filterEmail)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUserEmail(user.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !selectedUserEmail || !amount || !type) {
      alert('Please fill all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          user_email: selectedUserEmail,
          amount: amountNum,
          type,
          note,
          timestamp: timestamp || new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Reset form
        setSelectedUserId('');
        setSelectedUserEmail('');
        setAmount('');
        setType('given');
        setNote('');
        setTimestamp('');
        fetchPayments();
        alert('Payment recorded successfully!');
      } else {
        alert(data.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to record payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      const res = await fetch(`/api/payments?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPayments();
      } else {
        alert(data.message || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Payment Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Enter Admin Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Payment Management</h1>

      {/* Add Payment Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select User *</label>
              <Select value={selectedUserId} onValueChange={handleUserSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">User Email</label>
              <Input value={selectedUserEmail} readOnly className="bg-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <Select value={type} onValueChange={(v: 'given' | 'taken') => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="given">Given (User owes)</SelectItem>
                  <SelectItem value="taken">Taken (User paid)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date & Time</label>
              <Input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Note</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit" className="w-full md:w-auto">
                Add Payment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Filter by User Email</label>
              <Select
                value={filterEmail || FILTER_ALL_VALUE}
                onValueChange={(value) => setFilterEmail(value === FILTER_ALL_VALUE ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL_VALUE}>All users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user.email}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setFilterEmail('')}>
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History ({payments.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No payments found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(payment.timestamp)}
                      </TableCell>
                      <TableCell>
                        {users.find(u => u._id === payment.user_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{payment.user_email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          payment.type === 'given' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {payment.type === 'given' ? 'Given' : 'Taken'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{payment.note || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(payment._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
