"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Search, Users, Filter } from "lucide-react";
import { UserData } from "@/lib/types";
import UsersTable from "@/components/UsersTable";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import CreateUserForm from "@/components/CreateUserForm";
import EditUserForm from "@/components/EditUserForm";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import BlockConfirmationModal from "@/components/BlockConfirmationModal";
import useUsers from "@/hooks/useUsers";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UsersPage() {
  const { users, bannedUsersIDs, loading, error, refreshUsers } = useUsers();

  // modals states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // search and sort states
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("new");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  useEffect(() => {
    let filtered = users;
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    filtered = filtered.slice().sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "new" ? dateB - dateA : dateA - dateB;
    });
    setFilteredUsers(filtered);
  }, [search, users, sortOrder]);

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openChangePasswordModal = (user: UserData) => {
    setSelectedUser(user);
    setShowChangePasswordModal(true);
  };

  const openBlockModal = (user: UserData) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-none mb-0">
        <CardHeader className="pb-4 px-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    User Management
                  </CardTitle>
                  <p className="text-gray-600">
                    Manage user accounts and permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 h-10 w-64 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-36 h-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Newest First</SelectItem>
                      <SelectItem value="old">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create User
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50/80">
          <AlertDescription className="text-red-700 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0">
          <CardContent className="p-6 py-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-6 py-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {users.length - bannedUsersIDs.length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="p-6 py-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Blocked Users
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {bannedUsersIDs.length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onBlock={openBlockModal}
        onChangePassword={openChangePasswordModal}
        bannedUsersIDs={bannedUsersIDs}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserForm
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedUser(null);
          }}
          onConfirm={() => {
            setShowCreateModal(false);
            setSelectedUser(null);
            refreshUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserForm
          selectedUser={selectedUser}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onConfirm={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            refreshUsers();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          user={selectedUser}
          onConfirm={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
            refreshUsers();
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          user={selectedUser}
          onConfirm={() => {
            setShowChangePasswordModal(false);
            setSelectedUser(null);
            refreshUsers();
          }}
          onCancel={() => {
            setShowChangePasswordModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <BlockConfirmationModal
          user={selectedUser}
          onConfirm={() => {
            setShowBlockModal(false);
            setSelectedUser(null);
            refreshUsers();
          }}
          onCancel={() => {
            setShowBlockModal(false);
            setSelectedUser(null);
          }}
          isBlocked={bannedUsersIDs.includes(selectedUser?.id || "")}
        />
      )}
    </div>
  );
}
