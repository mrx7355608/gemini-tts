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
import useErrorLogs from "@/hooks/use-error-logs";
import Spinner from "@/components/Spinner";
import ErrorLogsTable from "@/components/ErrorLogsTable";
import ErrorDrawer from "@/components/ErrorDrawer";
import AdminNavbar from "@/components/AdminNavbar";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    errorLogs,
    loading,
    error,
    filteredLogs,
    setFilteredLogs,
    fetchErrorLogs,
  } = useErrorLogs();

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

  if (loading) {
    return <Spinner />;
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
      <AdminNavbar />

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
      <Card className="border-none py-0 shadow-none">
        <CardContent className="space-y-4 mt-5 p-0">
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
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

      {/* Error Logs Table */}
      <Card className="border-none py-0 shadow-none">
        <CardContent className="p-0">
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
            <ErrorLogsTable
              filteredLogs={filteredLogs}
              handleRowClick={(log: ErrorLog) => {
                setSelectedLog(log);
                setIsDrawerOpen(true);
              }}
              parseRaisedBy={parseRaisedBy}
              getSourceBadgeVariant={getSourceBadgeVariant}
            />
          )}
        </CardContent>
      </Card>

      {/* Error Details Drawer */}
      {selectedLog && (
        <ErrorDrawer
          selectedLog={selectedLog}
          parseRaisedBy={parseRaisedBy}
          getSourceBadgeVariant={getSourceBadgeVariant}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
        />
      )}
    </div>
  );
}
