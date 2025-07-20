"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  Clock,
  User,
  ExternalLink,
  RefreshCw,
  Search,
  Settings,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ErrorLog {
  id: string;
  error_message: string;
  error_description: string;
  raised_by: string;
  user_id: string;
  created_at: string;
  user_email?: string; // Add user email field
}

export default function ErrorLogs() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("error-logs")
        .select(
          `
          *,
          user_profile!inner(email)
        `
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to include user email at the top level
      const transformedData =
        data?.map((log) => ({
          ...log,
          user_email: log.user_profile?.email || "Unknown",
        })) || [];

      const filteredData = transformedData.filter(
        (log) => log.error_message !== null
      );

      setErrorLogs(filteredData || []);
      setFilteredLogs(filteredData || []);
    } catch (err: any) {
      console.error("Error fetching error logs:", err);
      setError(err.message || "Failed to fetch error logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  useEffect(() => {
    let filtered = errorLogs;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((log) => {
        const source = parseRaisedBy(log.raised_by).source.toLowerCase();
        return source.includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.raised_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.user_email &&
            log.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  }, [searchTerm, errorLogs, selectedCategory]);

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const parseRaisedBy = (raisedBy: string) => {
    const parts = raisedBy.split("-");
    return {
      source: parts[0]?.trim() || "Unknown",
      operation: parts[1]?.trim() || "Unknown",
    };
  };

  const getSourceBadgeVariant = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes("supabase")) {
      return "default";
    }
    if (lowerSource.includes("api")) {
      return "secondary";
    }
    if (lowerSource.includes("trigger")) {
      return "outline";
    }
    return "destructive";
  };

  const categories = ["All", "Supabase", "API Error", "Trigger"];

  const handleRowClick = (log: ErrorLog) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin mb-4">
              <RefreshCw className="w-12 h-12 mx-auto text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Error Logs
            </h2>
            <p className="text-gray-600">
              Please wait while we fetch the error logs...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Logs
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchErrorLogs} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-600 mt-1">
            Monitor and track system errors in real-time
          </p>
        </div>
        <Button onClick={fetchErrorLogs} variant="outline" className="shrink-0">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Search through error logs and filter by category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by error message, source, or user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200">
          <CardContent className="p-6 py-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Errors</p>
                <p className="text-2xl font-bold text-red-900">
                  {errorLogs.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-6 py-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Last 24 Hours
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {
                    errorLogs.filter(
                      (log) =>
                        new Date(log.created_at) >
                        new Date(Date.now() - 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6 py-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Filtered Results
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {filteredLogs.length}
                </p>
              </div>
              <Filter className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs</CardTitle>
          <CardDescription>
            {filteredLogs.length === 0
              ? searchTerm
                ? "No matching error logs found"
                : "No error logs found"
              : `Showing ${filteredLogs.length} error logs`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm
                  ? "No matching error logs found"
                  : "No error logs found"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "This is great! No errors have been logged yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%] px-6 py-4">
                      Error Message
                    </TableHead>
                    <TableHead className="w-[10%] px-6 py-4">Source</TableHead>
                    <TableHead className="w-[20%] px-6 py-4">
                      Operation
                    </TableHead>
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
          )}
        </CardContent>
      </Card>

      {/* Error Details Drawer */}
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

          {selectedLog && (
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
