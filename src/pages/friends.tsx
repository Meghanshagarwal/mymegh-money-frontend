import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Users, Trash2, ArrowLeft } from "lucide-react";
import type { Person } from "@shared/schema";
import AddFriendModal from "../components/add-friend-modal";
import BottomNavigation from "../components/bottom-navigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Friends() {
  const [, setLocation] = useLocation();
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState<Person | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading } = useQuery<Person[]>({
    queryKey: ["/api/people"],
  });

  const deleteFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const response = await apiRequest("DELETE", `/api/people/${friendId}`);
      if (!response.ok) {
        throw new Error("Failed to delete friend");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      queryClient.invalidateQueries({ queryKey: ["/api/people/balances"] });
      toast({
        title: "Friend deleted",
        description: "Your friend has been successfully removed.",
      });
      setFriendToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete friend. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4AA]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft size={20} className="text-[#2C3E50]" />
            </Button>
            <div className="w-10 h-10 bg-[#00D4AA]/10 rounded-full flex items-center justify-center">
              <Users className="text-[#00D4AA]" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2C3E50]">Friends</h1>
              <p className="text-gray-500 text-sm">{friends.length} friends</p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddFriendModalOpen(true)}
            className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white rounded-full h-12 w-12 p-0"
          >
            <Plus size={20} />
          </Button>
        </div>

        {/* Friends List */}
        <div className="space-y-3">
          {friends.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">No friends yet</h3>
                <p className="text-gray-500 text-sm mb-4">Add your first friend to start splitting expenses</p>
                <Button
                  onClick={() => setIsAddFriendModalOpen(true)}
                  className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white"
                >
                  <Plus size={16} className="mr-2" />
                  Add Friend
                </Button>
              </CardContent>
            </Card>
          ) : (
            friends.map((friend) => (
              <Card key={friend.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={friend.avatar} 
                        alt={friend.name}
                        className="object-cover"
                      />
                      <AvatarFallback 
                        className="text-white font-semibold"
                        style={{ backgroundColor: friend.color }}
                      >
                        {friend.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2C3E50]">{friend.name}</h3>
                      <p className="text-sm text-gray-500">Friend</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setFriendToDelete(friend)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Friend Modal */}
        <AddFriendModal
          isOpen={isAddFriendModalOpen}
          onClose={() => setIsAddFriendModalOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!friendToDelete} onOpenChange={() => setFriendToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Friend</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {friendToDelete?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => friendToDelete && deleteFriendMutation.mutate(friendToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <BottomNavigation />
    </div>
  );
}