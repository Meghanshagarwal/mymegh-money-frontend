import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Smile } from "lucide-react";
import { avatarOptions, getRandomAvatar } from "@/lib/avatars";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const watchedName = form.watch("name");
  const initials = watchedName
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createFriendMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/people", {
        name: data.name,
        initials: initials || data.name.charAt(0).toUpperCase(),
        color: selectedAvatar.color,
        avatar: selectedAvatar.imageUrl,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      queryClient.invalidateQueries({ queryKey: ["/api/people/balances"] });
      toast({
        title: "Friend added",
        description: "Your friend has been successfully added.",
      });
      onClose();
      form.reset();
      setSelectedAvatar(avatarOptions[0]);
    },
    onError: (error) => {
      console.error("Create friend error:", error);
      toast({
        title: "Error",
        description: "Failed to add friend. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createFriendMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2C3E50]">Add Friend</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200">
                <img 
                  src={selectedAvatar.imageUrl} 
                  alt={selectedAvatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-600">{selectedAvatar.name}</p>
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Friend's Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter friend's name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-3">
                <Smile className="inline w-4 h-4 mr-2" />
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 gap-3 max-h-40 overflow-y-auto">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                      selectedAvatar.id === avatar.id 
                        ? "border-[#00D4AA] scale-110" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img 
                      src={avatar.imageUrl} 
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-4 py-3 border border-gray-200 text-[#2C3E50] rounded-xl hover:bg-gray-50 transition-colors"
                onClick={onClose}
                disabled={createFriendMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#00D4AA] text-white rounded-xl hover:bg-[#00D4AA]/90 transition-colors"
                disabled={createFriendMutation.isPending}
              >
                {createFriendMutation.isPending ? "Adding..." : "Add Friend"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}