import { X, Trash2, Loader2 } from "lucide-react";
import { UserData } from "@/lib/types";

interface DeleteConfirmationModalProps {
  user: UserData | null;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function DeleteConfirmationModal({
  user,
  onConfirm,
  onCancel,
  submitting,
}: DeleteConfirmationModalProps) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0  backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-red-600">Delete User</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{user.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
