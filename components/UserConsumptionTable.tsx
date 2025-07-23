import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

export default function UserConsumptionTable({
  userConsumption,
}: {
  userConsumption: any[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              User
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Email
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Requests
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Models Used
            </th>
          </tr>
        </thead>
        <tbody>
          {userConsumption.slice(0, 10).map((user, index) => (
            <tr
              key={user.user_id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {index + 1}
                  {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
              </td>
              <td className="py-3 px-4 font-medium">{user.user_name}</td>
              <td className="py-3 px-4 text-gray-600">{user.user_email}</td>
              <td className="py-3 px-4">
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  {user.total_requests} requests
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {user.models_used.map((model: string) => (
                    <Badge key={model} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
