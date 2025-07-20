import { AlertTriangle, Ban, X, Loader2 } from "lucide-react";
import { UserData } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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

      toast.success(
        isBlocked
          ? "User unblocked successfully!"
          : "User blocked successfully!",
        {
          description: isBlocked
            ? `${user.full_name} can now access the application again.`
            : `${user.full_name} has been blocked from accessing the application.`,
        }
      );
      onConfirm();
    } catch (error: any) {
      toast.error(
        isBlocked ? "Failed to unblock user" : "Failed to block user",
        {
          description:
            error.message || "An error occurred while processing your request.",
        }
      );
      console.error("Failed to block user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isBlocked ? "bg-green-100" : "bg-amber-100"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    isBlocked ? "text-green-600" : "text-amber-600"
                  }`}
                />
              </div>
              <CardTitle
                className={`text-xl font-semibold ${
                  isBlocked ? "text-green-600" : "text-amber-600"
                }`}
              >
                {isBlocked ? "Unblock User" : "Block User"}
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
          <div
            className={`border rounded-lg p-4 ${
              isBlocked
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <Ban
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isBlocked ? "text-green-600" : "text-amber-600"
                }`}
              />
              <div>
                <p className="text-gray-900 font-medium">
                  Are you sure you want to {isBlocked ? "unblock" : "block"}{" "}
                  <span className="font-semibold">{user.full_name}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {isBlocked
                    ? "This user will be able to access the application again."
                    : "This user will no longer be able to access the application."}
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
              onClick={handleBlockUser}
              disabled={submitting}
              className={`cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isBlocked
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isBlocked ? "Unblocking..." : "Blocking..."}
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  {isBlocked ? "Unblock User" : "Block User"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
