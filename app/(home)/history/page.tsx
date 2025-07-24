import { getHistory } from "@/lib/history-services";
import { Mic, AlertCircle } from "lucide-react";
import { HistoryItem } from "@/lib/types";
import HistoryTable from "../../../components/HistoryTable";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between mt-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              History
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage your text-to-speech generation history
            </p>
          </div>
        </div>

        {/* History Table */}
        <Card className="shadow-none border-none">
          <CardContent className="p-0 h-full">
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
