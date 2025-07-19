import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Person } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Gift, DollarSign } from "lucide-react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  amountPaidFor: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  paidForPersonId: z.string().min(1, "Please select a person"),
  category: z.string().min(1, "Please select a category"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  bankApp: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const paymentCategories = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

const onlinePaymentMethods = [
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "gift_card", label: "Gift Card", icon: Gift },
  { value: "online_payment", label: "Other Online", icon: Smartphone },
];

const offlinePaymentMethods = [
  { value: "cash", label: "Cash", icon: DollarSign },
];

const upiApps = [
  { value: "paytm", label: "Paytm" },
  { value: "gpay", label: "Google Pay" },
  { value: "amazonpay", label: "Amazon Pay" },
  { value: "phonepe", label: "PhonePe" },
  { value: "other_upi", label: "Other UPI App" },
];

const categories = [
  { value: "food", label: "Food & Dining" },
  { value: "gift", label: "Gifts" },
  { value: "recharge", label: "Mobile Recharge" },
  { value: "bill", label: "Bills" },
  { value: "other", label: "Other" },
];

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: people } = useQuery<Person[]>({
    queryKey: ["/api/people"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountPaidFor: "",
      paidForPersonId: "",
      category: "",
      paymentMethod: "",
      bankApp: "",
      notes: "",
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/expenses", {
        ...data,
        isPaid: false,
        amountPaid: "0",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/people/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
      toast({
        title: "Expense added",
        description: "Your expense has been successfully recorded.",
      });
      onClose();
      form.reset();
      setSelectedPaymentCategory("");
      setSelectedPaymentMethod("");
      setSelectedUpiApp("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createExpenseMutation.mutate(data);
  };

  const handlePaymentCategorySelect = (category: string) => {
    setSelectedPaymentCategory(category);
    setSelectedPaymentMethod("");
    setSelectedUpiApp("");
    form.setValue("paymentMethod", "");
    form.setValue("bankApp", "");
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    form.setValue("paymentMethod", method);
    
    if (method !== "upi") {
      setSelectedUpiApp("");
      form.setValue("bankApp", "");
    }
  };

  const handleUpiAppSelect = (app: string) => {
    setSelectedUpiApp(app);
    form.setValue("bankApp", app);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2C3E50]">Add Expense</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amountPaidFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Amount Paid For
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none"
                        step="0.01"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidForPersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Paid For
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none">
                        <SelectValue placeholder="Select person..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {people?.map((person) => (
                        <SelectItem key={person.id} value={person.id.toString()}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Payment Method
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Payment Category Selection */}
                      <div className="grid grid-cols-2 gap-2">
                        {paymentCategories.map((category) => {
                          const isSelected = selectedPaymentCategory === category.value;
                          return (
                            <button
                              key={category.value}
                              type="button"
                              className={`p-3 border rounded-xl text-center transition-colors ${
                                isSelected
                                  ? "border-[#00D4AA] bg-[#00D4AA]/5"
                                  : "border-gray-200 hover:border-[#00D4AA] hover:bg-[#00D4AA]/5"
                              }`}
                              onClick={() => handlePaymentCategorySelect(category.value)}
                            >
                              <p className="text-sm font-medium text-[#2C3E50]">{category.label}</p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Payment Method Selection */}
                      {selectedPaymentCategory && (
                        <div className="grid grid-cols-2 gap-2">
                          {(selectedPaymentCategory === "online" ? onlinePaymentMethods : offlinePaymentMethods).map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedPaymentMethod === method.value;
                            return (
                              <button
                                key={method.value}
                                type="button"
                                className={`p-3 border rounded-xl text-center transition-colors ${
                                  isSelected
                                    ? "border-[#00D4AA] bg-[#00D4AA]/5"
                                    : "border-gray-200 hover:border-[#00D4AA] hover:bg-[#00D4AA]/5"
                                }`}
                                onClick={() => handlePaymentMethodSelect(method.value)}
                              >
                                <Icon className="text-[#00D4AA] mb-1 mx-auto" size={16} />
                                <p className="text-xs text-[#2C3E50]">{method.label}</p>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* UPI App Selection */}
                      {selectedPaymentMethod === "upi" && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[#2C3E50]">Select UPI App:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {upiApps.map((app) => {
                              const isSelected = selectedUpiApp === app.value;
                              return (
                                <button
                                  key={app.value}
                                  type="button"
                                  className={`p-2 border rounded-lg text-center transition-colors ${
                                    isSelected
                                      ? "border-[#00D4AA] bg-[#00D4AA]/5"
                                      : "border-gray-200 hover:border-[#00D4AA] hover:bg-[#00D4AA]/5"
                                  }`}
                                  onClick={() => handleUpiAppSelect(app.value)}
                                >
                                  <p className="text-xs text-[#2C3E50]">{app.label}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add any additional notes..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-4 py-3 border border-gray-200 text-[#2C3E50] rounded-xl hover:bg-gray-50 transition-colors"
                onClick={onClose}
                disabled={createExpenseMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#00D4AA] text-white rounded-xl hover:bg-[#00D4AA]/90 transition-colors"
                disabled={createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
