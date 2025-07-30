import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Shield, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { Main } from "@/components/ui/layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, UserRole, CreateUserForm, ROLE_LABELS } from "@/lib/types";
import { authenticatedFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useRoleAccess } from "@/hooks/useRoleAccess";

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super_admin", "admin", "ca", "builder", "broker", "user"]),
});

export default function UserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { canManageUsers } = useRoleAccess();

  // Redirect if no permission
  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "user",
    },
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/users");
      return response.json();
    },
  });

  const handleCreateUser = async (data: CreateUserForm) => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "User created successfully",
          description: `User ${data.username} has been created.`,
        });
        setIsCreateModalOpen(false);
        reset();
        refetch();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
    } catch (error) {
      toast({
        title: "Error creating user",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await authenticatedFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "User deleted successfully",
          description: "The user has been permanently removed.",
        });
        refetch();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-blue-100 text-blue-800",
      ca: "bg-purple-100 text-purple-800",
      builder: "bg-green-100 text-green-800",
      broker: "bg-orange-100 text-orange-800",
      user: "bg-gray-100 text-gray-800",
    };
    return colors[role];
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <>
      <Header
        title="User Management"
        subtitle="Manage user accounts and role-based permissions."
      />

      <Main>
        <Card>
          <CardHeader className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-cred-dark">All Users</h3>
                <p className="text-sm text-gray-600">
                  {users.length} total users
                </p>
              </div>
              <Button 
                className="bg-cred-mint text-cred-dark hover:bg-cred-mint/90"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={16} className="mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-48 h-4 bg-gray-200 rounded"></div>
                        <div className="w-32 h-3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !users.length ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first user account.</p>
                <Button 
                  className="bg-cred-mint text-cred-dark hover:bg-cred-mint/90"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Add User
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-cred-mint/10 rounded-full flex items-center justify-center mr-4">
                              <span className="font-semibold text-cred-dark">
                                {getInitials(user.firstName, user.lastName)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-cred-dark">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`${getRoleBadgeColor(user.role)}`}>
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {user.isActive ? (
                              <CheckCircle className="text-green-500 mr-2" size={16} />
                            ) : (
                              <XCircle className="text-red-500 mr-2" size={16} />
                            )}
                            <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-cred-dark">
              Create New User
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="mt-1 focus:ring-cred-mint border-gray-300"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="mt-1 focus:ring-cred-mint border-gray-300"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...register("username")}
                className="mt-1 focus:ring-cred-mint border-gray-300"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 focus:ring-cred-mint border-gray-300"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1 focus:ring-cred-mint border-gray-300"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={watch("role")}
                onValueChange={(value: UserRole) => setValue("role", value)}
              >
                <SelectTrigger className="mt-1 focus:ring-cred-mint border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-cred-mint text-cred-dark hover:bg-cred-mint/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
