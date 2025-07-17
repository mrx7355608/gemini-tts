"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { UserData, UserFormData } from "@/lib/types";
import UsersTable from "@/app/components/UsersTable";
import UserForm from "@/app/components/UserForm";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import { useAuth } from "../../../contexts/AuthContext";
import CreateUserForm from "@/app/components/CreateUserForm";

const supabase = createClient();

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    role: "user",
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("new"); // 'new' or 'old'

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // if (user?.role !== "admin") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-gray-600 text-2xl font-bold">
  //         You are not authorized to access this page
  //       </div>
  //     </div>
  //   );
  // }

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);

      const updateData = {
        full_name: "",
        email: "",
        role: "",
        password: "",
      };

      if (formData.email !== selectedUser.email) {
        updateData.email = formData.email;
      }

      if (formData.full_name !== selectedUser.full_name) {
        updateData.full_name = formData.full_name;
      }

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }

      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ full_name: "", email: "", role: "user", password: "" });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }

      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({ full_name: "", email: "", role: "user", password: "" });
    setSelectedUser(null);
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
        onBlock={() => {}}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserForm
          onCancel={() => setShowCreateModal(false)}
          onConfirm={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <UserForm
          title="Edit User"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditUser}
          onCancel={() => {
            setShowEditModal(false);
            resetForm();
          }}
          submitting={submitting}
          isEdit={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          user={selectedUser}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteModal(false);
            resetForm();
          }}
          submitting={submitting}
        />
      )}
    </div>
  );
}
