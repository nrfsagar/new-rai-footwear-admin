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

interface NotificationEntry {
  _id: string;
  token: string;
  name: string;
  phone: string;
  email: string;
  xvalue: number;
  timestamp: string;
}

export default function AllUsersPage() {
  const [users, setUsers] = useState<NotificationEntry[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    xvalue: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setUsers(data.devices);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEdit = (user: NotificationEntry) => {
    setEditId(user._id);
    setEditData({
      name: user.name || '',
      phone: user.phone || '',
      xvalue: user.xvalue || 0
    });
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        setEditId(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">User Notifications</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>X Value</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                {editId === user._id ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                ) : (
                  user.name || 'N/A'
                )}
              </TableCell>
              <TableCell>
                {editId === user._id ? (
                  <Input
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                ) : (
                  user.phone || 'N/A'
                )}
              </TableCell>
              <TableCell>{user.email || 'N/A'}</TableCell>
              <TableCell>
                {editId === user._id ? (
                  <Input
                    type="number"
                    value={editData.xvalue}
                    onChange={(e) => setEditData({...editData, xvalue: Number(e.target.value)})}
                  />
                ) : (
                  user.xvalue || 0
                )}
              </TableCell>
              <TableCell>
                {editId === user._id ? (
                  <Button onClick={() => handleSave(user._id)}>Save</Button>
                ) : (
                  <Button onClick={() => handleEdit(user)}>Edit</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
