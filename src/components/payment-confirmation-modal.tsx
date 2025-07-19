import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseWithPerson, ExpenseWithPayments } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseWithPerson | ExpenseWithPayments | null;
}

export default function PaymentConfirmationModal({ isOpen, onClose, expense }: PaymentConfirmationModalProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<"full" | "partial" | "custom">("full");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async ({ expenseId, amount, paymentType }: { expenseId: string; amount: number; paymentType: "full" | "partial" | "custom" }) => {
      const response = await apiRequest("PATCH", `/api/expenses/${expenseId}/pay`, { 
        amount, 
        paymentType,
        notes: null 
      });
      if (!response.ok) {
        let errorMessage = 'Payment failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/people/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
      toast({
        title: "Payment recorded",
        description: "The payment has been successfully recorded.",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCustomAmount("");
    setSelectedPaymentType("full");
  };

  if (!expense) return null;

  const totalAmount = parseFloat(expense.amountPaidFor);
  const amountPaid = parseFloat(expense.amountPaid || "0");
  const remaining = totalAmount - amountPaid;

  const handleConfirmPayment = () => {
    let paymentAmount = 0;

    switch (selectedPaymentType) {
      case "full":
        paymentAmount = remaining;
        break;
      case "partial":
        paymentAmount = remaining / 2; // Default to half
        break;
      case "custom":
        paymentAmount = parseFloat(customAmount);
        if (!paymentAmount || paymentAmount <= 0 || paymentAmount > remaining) {
          toast({
            title: "Invalid amount",
            description: `Please enter a valid amount between ₹0.01 and ${formatCurrency(remaining)}`,
            variant: "destructive",
          });
          return;
        }
        break;
    }

    paymentMutation.mutate({ expenseId: expense.id, amount: paymentAmount, paymentType: selectedPaymentType });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#00D4AA]/10 rounded-full flex items-center justify-center mb-4">
              <Check className="text-[#00D4AA] text-2xl" size={24} />
            </div>
            <DialogTitle className="text-xl font-semibold text-[#2C3E50] mb-2">
              Mark as Paid
            </DialogTitle>
            <p className="text-gray-500 mb-6">
              How much did <span className="font-medium">{expense.person.name}</span> pay for this {expense.category} expense?
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-3 mb-6">
          <Button
            variant={selectedPaymentType === "full" ? "default" : "outline"}
            className={`w-full p-3 ${
              selectedPaymentType === "full" 
                ? "bg-[#00D4AA]/10 text-[#00D4AA] hover:bg-[#00D4AA]/20" 
                : "border-gray-200 text-[#2C3E50] hover:bg-gray-50"
            } transition-colors`}
            onClick={() => setSelectedPaymentType("full")}
          >
            <span className="font-semibold">Full Amount: {formatCurrency(remaining)}</span>
          </Button>
          
          <Button
            variant={selectedPaymentType === "partial" ? "default" : "outline"}
            className={`w-full p-3 ${
              selectedPaymentType === "partial" 
                ? "bg-[#00D4AA]/10 text-[#00D4AA] hover:bg-[#00D4AA]/20" 
                : "border-gray-200 text-[#2C3E50] hover:bg-gray-50"
            } transition-colors`}
            onClick={() => setSelectedPaymentType("partial")}
          >
            <span>Partial Payment ({formatCurrency(remaining / 2)})</span>
          </Button>
          
          <div className="space-y-2">
            <Button
              variant={selectedPaymentType === "custom" ? "default" : "outline"}
              className={`w-full p-3 ${
                selectedPaymentType === "custom" 
                  ? "bg-[#00D4AA]/10 text-[#00D4AA] hover:bg-[#00D4AA]/20" 
                  : "border-gray-200 text-[#2C3E50] hover:bg-gray-50"
              } transition-colors`}
              onClick={() => setSelectedPaymentType("custom")}
            >
              <span>Custom Amount</span>
            </Button>
            
            {selectedPaymentType === "custom" && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none"
                  step="0.01"
                  min="0.01"
                  max={remaining}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1 px-4 py-3 border border-gray-200 text-[#2C3E50] rounded-xl hover:bg-gray-50 transition-colors"
            onClick={onClose}
            disabled={paymentMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 px-4 py-3 bg-[#27AE60] text-white rounded-xl hover:bg-[#27AE60]/90 transition-colors"
            onClick={handleConfirmPayment}
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? "Recording..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
