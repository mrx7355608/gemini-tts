import { AlertTriangle, Ban, X } from "lucide-react";
import { UserData } from "@/lib/types";
import { useState } from "react";

interface BlockConfirmationModalProps {
  user: UserData | null;
  onConfirm: () => void;
  onCancel: () => void;
  isBlocked: boolean;
}

export default function BlockConfirmationModal({
  user,
  onConfirm,
  onCancel,
  isBlocked = false,
}: BlockConfirmationModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleBlockUser = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      const url = `/api/users/${isBlocked ? "unblock" : "block"}/${user.id}`;

      const response = await fetch(url, {
        method: "PATCH",
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      onConfirm();
    } catch (error: any) {
      console.error("Failed to block user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
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
            onClick={handleBlockUser}
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
