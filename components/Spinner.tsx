import { Card, CardContent } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";

export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] p-6">
      <Card className="max-w-md w-full border-none shadow-none">
        <CardContent className="p-8 text-center">
          <div className="animate-spin mb-4">
            <LoaderCircle className="w-10 h-10 mx-auto text-gray-800" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
        </CardContent>
      </Card>
    </div>
  );
}
