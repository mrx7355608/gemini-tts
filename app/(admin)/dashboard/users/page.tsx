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
import Spinner from "@/components/Spinner";
import AdminNavbar from "@/components/AdminNavbar";
import UserDetailsDrawer from "@/components/UserDetailsDrawer";

export default function UsersPage() {
  const { users, bannedUsersIDs, loading, error, refreshUsers } = useUsers();

  // modals states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // drawer states
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [selectedUserForDrawer, setSelectedUserForDrawer] =
    useState<UserData | null>(null);

  // search and sort states
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("new");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => {
        const isBlocked = bannedUsersIDs.includes(u.id);
        return statusFilter === "blocked" ? isBlocked : !isBlocked;
      });
    }

    // Apply sort
    filtered = filtered.slice().sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "new" ? dateB - dateA : dateA - dateB;
    });

    setFilteredUsers(filtered);
  }, [search, users, sortOrder, roleFilter, statusFilter, bannedUsersIDs]);

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

  const openUserDrawer = (user: UserData) => {
    setSelectedUserForDrawer(user);
    setShowUserDrawer(true);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 pt-2 pb-6 max-w-7xl space-y-6">
      <AdminNavbar />
      {/* Header */}
      <Card className="border-0 shadow-none mb-0">
        <CardHeader className="pb-4 px-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold text-gray-900">
                User Management
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Manage user accounts, roles, and permissions
              </p>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create User
            </Button>
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

      {/* Search and Filter Controls */}
      <Card className="border-none py-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-10 h-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32 h-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

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
        </CardContent>
      </Card>

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onBlock={openBlockModal}
        onChangePassword={openChangePasswordModal}
        onViewDetails={openUserDrawer}
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

      {/* User Details Drawer */}
      {selectedUserForDrawer && (
        <UserDetailsDrawer
          selectedUser={selectedUserForDrawer}
          isDrawerOpen={showUserDrawer}
          setIsDrawerOpen={setShowUserDrawer}
          isBlocked={bannedUsersIDs.includes(selectedUserForDrawer?.id || "")}
        />
      )}
    </div>
  );
}
