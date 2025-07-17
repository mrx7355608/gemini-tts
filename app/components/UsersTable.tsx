import {
  User,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  X,
  AlertTriangle,
  Key,
} from "lucide-react";
import { UserData } from "@/lib/types";
import { useEffect, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

interface UsersTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onBlock: (user: UserData) => void;
  onChangePassword: (user: UserData) => void;
}

interface BlockConfirmationModalProps {
  user: UserData | null;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
  isBlocked: boolean;
}

function BlockConfirmationModal({
  user,
  onConfirm,
  onCancel,
  submitting,
  isBlocked = false,
}: BlockConfirmationModalProps) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-amber-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {isBlocked ? "Unblock User" : "Block User"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to {isBlocked ? "unblock" : "block"}{" "}
            <strong>{user.full_name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2 mb-3">
            {isBlocked
              ? "This user will be able to access the application again."
              : "This user will no longer be able to access the application."}
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            {isBlocked ? "Unblock User" : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  onBlock,
  onChangePassword,
}: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bannedUsersIDs, setBannedUsersIDs] = useState<string[]>([]);

  useEffect(() => {
    const fetchBannedUsers = async () => {
      const response = await fetch("/api/users");
      const data = await response.json();
      setBannedUsersIDs(data.data);
    };

    fetchBannedUsers();
  }, []);

  const handleMenuToggle = (userId: string) => {
    setOpenMenuId((prev) => (prev === userId ? null : userId));
  };

  const openBlockModal = (user: UserData) => {
    setSelectedUser(user);
    setShowBlockModal(true);
    setOpenMenuId(null);
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const url = `/api/users/${
        bannedUsersIDs.includes(selectedUser.id) ? "unblock" : "block"
      }/${selectedUser.id}`;

      const response = await fetch(url, {
        method: "PATCH",
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setShowBlockModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Failed to block user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeBlockModal = () => {
    setShowBlockModal(false);
    setSelectedUser(null);
    setSubmitting(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow h-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleMenuToggle(user.id)}
                      className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white rounded-full hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                          <div className="py-1">
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                setOpenMenuId(null);
                                onEdit(user);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-3 text-gray-400" />
                              Edit User
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                              onClick={() => onChangePassword(user)}
                            >
                              <Key className="w-4 h-4 mr-3 text-blue-500" />
                              Change Password
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                              onClick={() => openBlockModal(user)}
                            >
                              <Ban className="w-4 h-4 mr-3 text-amber-500" />
                              {bannedUsersIDs.includes(user.id)
                                ? "Unblock User"
                                : "Block User"}
                            </button>
                            <div className="border-t border-gray-100" />
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => {
                                setOpenMenuId(null);
                                onDelete(user);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-3 text-red-500" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <BlockConfirmationModal
          user={selectedUser}
          onConfirm={handleBlockUser}
          onCancel={closeBlockModal}
          submitting={submitting}
          isBlocked={bannedUsersIDs.includes(selectedUser?.id || "")}
        />
      )}
    </>
  );
}
