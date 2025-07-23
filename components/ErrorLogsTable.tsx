import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Settings, User, Clock } from "lucide-react";

export default function ErrorLogsTable({
  filteredLogs,
  handleRowClick,
  parseRaisedBy,
  getSourceBadgeVariant,
}: {
  filteredLogs: any[];
  handleRowClick: (log: any) => void;
  parseRaisedBy: (raisedBy: string) => { source: string; operation: string };
  getSourceBadgeVariant: (
    source: string
  ) => "default" | "destructive" | "secondary" | "outline";
}) {
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%] px-6 py-4">Error Message</TableHead>
            <TableHead className="w-[10%] px-6 py-4">Source</TableHead>
            <TableHead className="w-[20%] px-6 py-4">Operation</TableHead>
            <TableHead className="w-[20%] px-6 py-4">User</TableHead>
            <TableHead className="w-[20%] px-6 py-4">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log) => (
            <TableRow
              key={log.id}
              className="hover:bg-gray-50/50 cursor-pointer transition-colors"
              onClick={() => handleRowClick(log)}
            >
              <TableCell className="px-6 py-4">
                <div className="max-w-full flex items-start gap-3">
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium text-gray-900 leading-relaxed"
                      title={log.error_message}
                    >
                      {truncateText(log.error_message, 60)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <Badge
                  variant={getSourceBadgeVariant(
                    parseRaisedBy(log.raised_by).source
                  )}
                  className="whitespace-nowrap"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {parseRaisedBy(log.raised_by).source}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex items-center">
                  <Settings className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-900 truncate">
                    {parseRaisedBy(log.raised_by).operation}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-900 truncate">
                    {log.user_email || "Unknown"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-900 truncate">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
