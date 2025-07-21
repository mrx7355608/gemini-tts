import { getHistory } from "@/lib/history-services";
import {
  Clock,
  Mic,
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar,
} from "lucide-react";
import { HistoryItem } from "@/lib/types";
import HistoryTable from "../../../components/HistoryTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default async function HistoryPage() {
  const history = await getHistory();

  // Handle error case
  if (history && "error" in history) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full shadow-xl border-0 bg-white/95 backdrop-blur">
              <CardContent className="text-center py-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Error Loading History
                </h2>
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{history.error}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const historyData = history as HistoryItem[];
  const totalGenerations = historyData?.length || 0;
  const recentGenerations =
    historyData?.filter((item) => {
      const itemDate = new Date(item.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              History
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage your text-to-speech generation history
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {totalGenerations}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  All Time
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {recentGenerations}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  Last 7 Days
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {historyData && historyData.length > 0
                    ? new Date(historyData[0].created_at).toLocaleDateString()
                    : "No data"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {historyData && historyData.length > 0
                    ? new Date(historyData[0].created_at).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "--:--"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-green-600" />
              Generation History
            </CardTitle>
            <CardDescription>
              Complete history of your text-to-speech generations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!historyData || historyData.length === 0 ? (
              <div className="p-16 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <Mic className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No history yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start generating audio to see your history here. Your
                  generations will appear in this table once you create them.
                </p>
                <Badge variant="outline" className="text-sm">
                  Get started by creating your first generation
                </Badge>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <HistoryTable historyData={historyData} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
