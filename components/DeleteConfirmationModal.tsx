import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { UserData } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface DeleteConfirmationModalProps {
  user: UserData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  user,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleDeleteUser = async () => {
    if (!user) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success("User deleted successfully!", {
        description: `${user.full_name} has been removed from the system.`,
      });
      onConfirm();
    } catch (err: any) {
      toast.error("Failed to delete user", {
        description:
          err.message || "An error occurred while deleting the user.",
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-red-600">
                Delete User
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{user.full_name}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This action cannot be undone. All user data will be
                  permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="cursor-pointer hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
