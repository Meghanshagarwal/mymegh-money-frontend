import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate, getCategoryIcon, getPaymentMethodIcon } from "@/lib/utils";
import type { ExpenseWithPerson } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentConfirmationModal from "./payment-confirmation-modal";
import ExpenseDetailsModal from "./expense-details-modal";
import { useLocation } from "wouter";

export default function RecentTransactions() {
  const [, setLocation] = useLocation();
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithPerson | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  const { data: expenses, isLoading } = useQuery<ExpenseWithPerson[]>({
    queryKey: ["/api/expenses"],
  });

  const handleMarkAsPaid = (expense: ExpenseWithPerson) => {
    setSelectedExpense(expense);
    setIsPaymentModalOpen(true);
  };

  const handleExpenseClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <section className="px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#2C3E50]">Recent Activity</h2>
          <button 
            onClick={() => setLocation('/activity')}
            className="text-[#00D4AA] text-sm font-medium hover:text-[#00D4AA]/80 transition-colors"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Filter out fully paid expenses and show only recent unpaid ones
  const unpaidExpenses = expenses?.filter(expense => !expense.isPaid) || [];
  const recentExpenses = unpaidExpenses.slice(0, 5);

  return (
    <>
      <section className="px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#2C3E50]">Recent Activity</h2>
          <button 
            onClick={() => setLocation('/activity')}
            className="text-[#00D4AA] text-sm font-medium hover:text-[#00D4AA]/80 transition-colors"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {recentExpenses.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <p className="text-gray-500 text-sm">No pending expenses. All caught up!</p>
            </div>
          ) : (
            recentExpenses.map((expense) => {
            const amount = parseFloat(expense.amountPaidFor);
            const amountPaid = parseFloat(expense.amountPaid || "0");
            const remaining = amount - amountPaid;
            const isFullyPaid = expense.isPaid;
            const isPartiallyPaid = amountPaid > 0 && !isFullyPaid;

            return (
              <div 
                key={expense.id} 
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transaction-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleExpenseClick(expense.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className={`${getCategoryIcon(expense.category)} text-gray-600`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2C3E50]">{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Paid for <span className="font-medium">{expense.person.name}</span>
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="bg-gray-100 px-2 py-1 rounded-md">
                          <span className="text-xs text-gray-600">
                            {expense.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(expense.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#27AE60]">
                      +{formatCurrency(amount)}
                    </p>
                    {!isFullyPaid && (
                      <p className="text-xs text-gray-500 mt-1">
                        Remaining: {formatCurrency(remaining)}
                      </p>
                    )}
                    {isFullyPaid ? (
                      <div className="mt-2 bg-[#27AE60]/10 text-[#27AE60] px-3 py-1 rounded-lg text-xs flex items-center">
                        <i className="fas fa-check mr-1"></i>Paid
                      </div>
                    ) : isPartiallyPaid ? (
                      <Button 
                        size="sm" 
                        className="mt-2 bg-[#F39C12] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#F39C12]/90 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsPaid(expense);
                        }}
                      >
                        Partial Paid
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="mt-2 bg-[#00D4AA] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#00D4AA]/90 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsPaid(expense);
                        }}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </section>

      <PaymentConfirmationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        expense={selectedExpense}
      />

      <ExpenseDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        expenseId={selectedExpenseId}
      />
    </>
  );
}
