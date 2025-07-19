import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate, getCategoryIcon } from "@/lib/utils";
import type { ExpenseWithPayments } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CreditCard, User, CalendarDays, Receipt, History } from "lucide-react";
import PaymentConfirmationModal from "./payment-confirmation-modal";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string | null;
}

export default function ExpenseDetailsModal({ isOpen, onClose, expenseId }: ExpenseDetailsModalProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: expenseDetails, isLoading, refetch } = useQuery<ExpenseWithPayments>({
    queryKey: [`/api/expenses/${expenseId}/details`],
    enabled: !!expenseId && isOpen,
  });

  const handleMarkAsPaid = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    refetch(); // Refresh the expense details after payment
  };

  if (!expenseId) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold text-[#2C3E50] flex items-center gap-2">
              <Receipt size={18} />
              Expense Details
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4AA]"></div>
            </div>
          ) : expenseDetails && expenseDetails.category && expenseDetails.person ? (
            <div className="space-y-4">
              {/* Expense Overview */}
              <Card className="border-none shadow-sm bg-gradient-to-r from-[#00D4AA]/5 to-[#00D4AA]/10">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#00D4AA]/10 rounded-lg flex items-center justify-center">
                        <i className={`${getCategoryIcon(expenseDetails.category)} text-[#00D4AA] text-sm`}></i>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#2C3E50]">
                          {expenseDetails.category.charAt(0).toUpperCase() + expenseDetails.category.slice(1)}
                        </h3>
                        <p className="text-gray-500 text-xs">
                          Paid for <span className="font-medium">{expenseDetails.person.name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#27AE60]">
                        {formatCurrency(parseFloat(expenseDetails.amountPaidFor))}
                      </p>
                      <div className={`mt-1 px-2 py-1 rounded-full text-xs ${
                        expenseDetails.isPaid 
                          ? 'bg-[#27AE60]/10 text-[#27AE60]' 
                          : 'bg-[#F39C12]/10 text-[#F39C12]'
                      }`}>
                        {expenseDetails.isPaid ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <CreditCard size={14} />
                      <span className="truncate">{expenseDetails.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <CalendarDays size={14} />
                      <span className="truncate">{formatDate(expenseDetails.createdAt)}</span>
                    </div>
                  </div>

                  {expenseDetails.notes && (
                    <div className="mt-2 p-2 bg-white/50 rounded-lg">
                      <p className="text-xs text-gray-600">{expenseDetails.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Progress */}
              {!expenseDetails.isPaid && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-[#2C3E50]">Payment Progress</h4>
                      <Button 
                        size="sm" 
                        onClick={handleMarkAsPaid}
                        className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-xs h-8 px-3"
                      >
                        Record Payment
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Paid: {formatCurrency(parseFloat(expenseDetails.amountPaid || "0"))}</span>
                        <span>Total: {formatCurrency(parseFloat(expenseDetails.amountPaidFor))}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#00D4AA] h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (parseFloat(expenseDetails.amountPaid || "0") / parseFloat(expenseDetails.amountPaidFor)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Remaining: {formatCurrency(parseFloat(expenseDetails.amountPaidFor) - parseFloat(expenseDetails.amountPaid || "0"))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment History */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <History size={14} className="text-[#2C3E50]" />
                    <h4 className="text-sm font-medium text-[#2C3E50]">Payment History</h4>
                    <span className="text-xs text-gray-500">({expenseDetails.payments?.length || 0} payments)</span>
                  </div>

                  {expenseDetails.payments && expenseDetails.payments.length > 0 ? (
                    <div className="space-y-2">
                      {expenseDetails.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#27AE60]/10 rounded-full flex items-center justify-center">
                              <Clock size={12} className="text-[#27AE60]" />
                            </div>
                            <div>
                              <p className="font-medium text-xs text-[#2C3E50]">
                                {formatCurrency(parseFloat(payment.amount))}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(payment.createdAt)} • {payment.paymentType} payment
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-xs ${
                            payment.paymentType === 'full' ? 'bg-[#27AE60]/10 text-[#27AE60]' :
                            payment.paymentType === 'partial' ? 'bg-[#F39C12]/10 text-[#F39C12]' :
                            'bg-[#3498DB]/10 text-[#3498DB]'
                          }`}>
                            {payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <History size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">No payments recorded yet</p>
                      <p className="text-xs text-gray-400 mt-1">Payment history will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Failed to load expense details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentConfirmationModal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentSuccess}
        expense={expenseDetails || null}
      />
    </>
  );
}