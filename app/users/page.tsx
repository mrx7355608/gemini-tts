"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { UserData, UserFormData } from "@/lib/types";
import UsersTable from "@/app/components/UsersTable";
import UserForm from "@/app/components/UserForm";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import { useAuth } from "../contexts/AuthContext";

const supabase = createClient();

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
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

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleCreateUser = async () => {
    try {
      setSubmitting(true);

      // Validate form data
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required");
      }

      // Create user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
          },
        },
      });

      if (error) throw error;

      // Insert into user_profile table
      const { error: insertError } = await supabase
        .from("user_profile")
        .insert({
          id: data.user?.id,
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
        });

      if (insertError) throw insertError;

      setShowCreateModal(false);
      setFormData({ full_name: "", email: "", role: "user" });
      fetchUsers();
    } catch (err) {
      setError("Failed to create user");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("user_profile")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ full_name: "", email: "", role: "user" });
      fetchUsers();
    } catch (err) {
      setError("Failed to update user");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("user_profile")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError("Failed to delete user");
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
    setFormData({ full_name: "", email: "", role: "user" });
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Users Table */}
      <UsersTable
        users={users}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <UserForm
          title="Create New User"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateUser}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          submitting={submitting}
          isEdit={false}
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
