import {
  AlertTriangle,
  Info,
  Settings,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function ErrorDrawer({
  selectedLog,
  parseRaisedBy,
  getSourceBadgeVariant,
  isDrawerOpen,
  setIsDrawerOpen,
}: {
  selectedLog: any;
  parseRaisedBy: (raisedBy: string) => { source: string; operation: string };
  getSourceBadgeVariant: (
    source: string
  ) => "default" | "destructive" | "secondary" | "outline";
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}) {
  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent className="p-6 py-4 w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Error Details
          </SheetTitle>
          <SheetDescription>
            Complete information about the selected error log
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Error ID */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Error ID
            </h3>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <code className="text-xs text-gray-800 break-all">
                {selectedLog.id}
              </code>
            </div>
          </div>

          {/* Error Message */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Error Message
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900 break-words leading-relaxed">
                {selectedLog.error_message}
              </p>
            </div>
          </div>

          {/* Error Description */}
          {selectedLog.error_description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Description
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 break-words leading-relaxed">
                  {selectedLog.error_description}
                </p>
              </div>
            </div>
          )}

          {/* Source Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              Source Information
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Source:
                </span>
                <Badge
                  variant={getSourceBadgeVariant(
                    parseRaisedBy(selectedLog.raised_by).source
                  )}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {parseRaisedBy(selectedLog.raised_by).source}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Operation:
                </span>
                <span className="text-sm text-gray-900">
                  {parseRaisedBy(selectedLog.raised_by).operation}
                </span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              User Information
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">
                  Email:
                </span>
                <span className="text-sm text-blue-900">
                  {selectedLog.user_email || "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">
                  User ID:
                </span>
                <span className="text-sm text-blue-900 font-mono break-all">
                  {selectedLog.user_id}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamp Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              Timestamp
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    Date:
                  </span>
                  <span className="text-sm text-green-900">
                    {new Date(selectedLog.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    Time:
                  </span>
                  <span className="text-sm text-green-900">
                    {new Date(selectedLog.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    Full Timestamp:
                  </span>
                  <span className="text-xs text-green-800 font-mono">
                    {selectedLog.created_at}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
