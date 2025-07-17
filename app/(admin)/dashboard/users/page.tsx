"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { UserData } from "@/lib/types";
import UsersTable from "@/app/components/UsersTable";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import { useAuth } from "../../../contexts/AuthContext";
import CreateUserForm from "@/app/components/CreateUserForm";
import EditUserForm from "@/app/components/EditUserForm";
import ChangePasswordModal from "@/app/components/ChangePasswordModal";
import BlockConfirmationModal from "@/app/components/BlockConfirmationModal";
import useUsers from "@/app/hooks/useUsers";

export default function Users() {
  const { user } = useAuth();
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

  // if (user?.role !== "admin") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-gray-600 text-2xl font-bold">
  //         You are not authorized to access this page
  //       </div>
  //     </div>
  //   );
  // }

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
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Users
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

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
