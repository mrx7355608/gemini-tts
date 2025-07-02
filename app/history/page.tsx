import { getHistory } from "@/lib/history-services";
import Navbar from "../components/Navbar";
import { Clock, Mic, Settings } from "lucide-react";
import { HistoryItem } from "@/lib/types";
import HistoryTable from "../components/HistoryTable";

export default async function HistoryPage() {
  const history = await getHistory();

  // Handle error case
  if (history && "error" in history) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <Settings className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading History
            </h2>
            <p className="text-gray-600">{history.error}</p>
          </div>
        </div>
      </>
    );
  }

  const historyData = history as HistoryItem[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6">
        <div className="p-8 w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-start">
              <Clock className="w-6 h-6 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">History</h1>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {!historyData || historyData.length === 0 ? (
              <div className="p-12 text-center">
                <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No history yet
                </h3>
                <p className="text-gray-500">
                  Start generating audio to see your history here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <HistoryTable historyData={historyData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
