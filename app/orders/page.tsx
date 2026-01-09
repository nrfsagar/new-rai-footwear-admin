'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ADMIN_PASSWORD = 'Mukul@0610';

type OrderUser = {
  _id?: string;
  name?: string;
  email?: string;
};

type OrderProduct = {
  _id: string;
  name?: string;
  category?: string;
};

type OrderRow = {
  _id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: string;
  createdAt?: string;
  user?: OrderUser | null;
  user_name?: string | null;
  user_email?: string | null;
  product?: OrderProduct | null;
};

function formatDate(date?: string) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.valueOf())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [pendingOrders, setPendingOrders] = useState<OrderRow[]>([]);
  const [submittedOrders, setSubmittedOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterEmail, setFilterEmail] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('orders_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filterEmail]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('orders_auth', 'true');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const expand = 'user,product';

      const pendingUrl = new URL('/api/orders', window.location.origin);
      pendingUrl.searchParams.set('status', 'pending');
      pendingUrl.searchParams.set('expand', expand);

      const submittedUrl = new URL('/api/orders', window.location.origin);
      submittedUrl.searchParams.set('status', 'submitted,confirmed');
      submittedUrl.searchParams.set('expand', expand);

      const [pendingRes, submittedRes] = await Promise.all([
        fetch(pendingUrl.toString()),
        fetch(submittedUrl.toString()),
      ]);

      const pendingData = await pendingRes.json();
      const submittedData = await submittedRes.json();

      const pending: OrderRow[] = Array.isArray(pendingData?.orders) ? pendingData.orders : [];
      const submitted: OrderRow[] = Array.isArray(submittedData?.orders) ? submittedData.orders : [];

      const email = filterEmail.trim().toLowerCase();
      if (email) {
        setPendingOrders(pending.filter((o) => (o.user_email || o.user?.email || '').toLowerCase().includes(email)));
        setSubmittedOrders(submitted.filter((o) => (o.user_email || o.user?.email || '').toLowerCase().includes(email)));
      } else {
        setPendingOrders(pending);
        setSubmittedOrders(submitted);
      }
    } catch (e) {
      console.error('Failed to fetch orders', e);
      setPendingOrders([]);
      setSubmittedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(
    () => ({ pending: pendingOrders.length, submitted: submittedOrders.length }),
    [pendingOrders.length, submittedOrders.length]
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-black">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="mt-1 text-sm text-neutral-600">Admin login required</p>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Enter Admin Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              <div className="flex items-center gap-3">
                <Button onClick={handleLogin}>Login</Button>
                <Link className="text-sm underline" href="/">
                  Back to dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const OrdersTable = ({ rows }: { rows: OrderRow[] }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-neutral-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell className="font-mono">{o._id}</TableCell>
                    <TableCell>{o.user_name || o.user?.name || '—'}</TableCell>
                    <TableCell>{o.user_email || o.user?.email || '—'}</TableCell>
                    <TableCell>{o.product?.name || o.product_id}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Orders</h1>
              <p className="mt-1 text-sm text-neutral-600">Pending and submitted orders with user details</p>
            </div>
            <div className="flex items-center gap-3">
              <Link className="text-sm underline" href="/">
                Back
              </Link>
              <Button variant="outline" onClick={() => void fetchOrders()} disabled={loading}>
                {loading ? 'Refreshing…' : 'Refresh'}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>Pending: {counts.pending}</span>
              <span>•</span>
              <span>Submitted: {counts.submitted}</span>
            </div>

            <div className="w-full sm:w-80">
              <Input
                placeholder="Filter by user email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({counts.submitted})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <OrdersTable rows={pendingOrders} />
          </TabsContent>

          <TabsContent value="submitted">
            <OrdersTable rows={submittedOrders} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
