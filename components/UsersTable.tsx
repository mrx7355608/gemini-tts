import {
  User,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  Key,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { UserData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UsersTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onBlock: (user: UserData) => void;
  onChangePassword: (user: UserData) => void;
  onViewDetails: (user: UserData) => void;
  bannedUsersIDs: string[];
}

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  onBlock,
  onChangePassword,
  onViewDetails,
  bannedUsersIDs,
}: UsersTableProps) {
  return (
    <Card className="border border-gray-300 shadow-none py-0 overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700 pl-5">
                User
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Email
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Role
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Created
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isBanned = bannedUsersIDs.includes(user.id);
              return (
                <TableRow
                  key={user.id}
                  className={`hover:bg-gray-50/50 transition-colors ${
                    isBanned ? "bg-red-50/50" : ""
                  }`}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={`${
                            isBanned
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.full_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-gray-700 capitalize">
                      {user.role}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={isBanned ? "destructive" : "secondary"}
                      className={`text-xs ${
                        isBanned
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}
                    >
                      {isBanned ? (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Blocked
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => onViewDetails(user)}
                          className="cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2 text-green-600" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onEdit(user)}
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2 text-gray-500" />
                          Edit User
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onChangePassword(user)}
                          className="cursor-pointer"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Change Password
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onBlock(user)}
                          className="cursor-pointer"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {isBanned ? "Unblock User" : "Block User"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onDelete(user)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
