import { User, MoreVertical, Edit, Trash2, Ban, Key } from "lucide-react";
import { UserData } from "@/lib/types";
import { useEffect, useState } from "react";

interface UsersTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onBlock: (user: UserData) => void;
  onChangePassword: (user: UserData) => void;
  bannedUsersIDs: string[];
}

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  onBlock,
  onChangePassword,
  bannedUsersIDs,
}: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuToggle = (userId: string) => {
    setOpenMenuId((prev) => (prev === userId ? null : userId));
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
              <tr
                key={user.id}
                className={`hover:bg-gray-50 ${
                  bannedUsersIDs.includes(user.id) ? "bg-red-100" : "bg-white"
                }`}
              >
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
                      className="border inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white rounded-full hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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
                              onClick={() => onBlock(user)}
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
    </>
  );
}
