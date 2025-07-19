import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { formatCurrency, formatDate, getCategoryIcon } from "@/lib/utils";
import type { ExpenseWithPerson } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Filter, ArrowLeft } from "lucide-react";
import PaymentConfirmationModal from "../components/payment-confirmation-modal";
import ExpenseDetailsModal from "../components/expense-details-modal";
import BottomNavigation from "../components/bottom-navigation";

export default function ActivityPage() {
  const [, setLocation] = useLocation();
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithPerson | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const { data: expenses = [], isLoading } = useQuery<ExpenseWithPerson[]>({
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

  // Filter expenses based on the selected filter
  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'paid') return expense.isPaid;
    if (filter === 'unpaid') return !expense.isPaid;
    return true; // 'all'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
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
              <Activity className="text-[#00D4AA]" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2C3E50]">Activity</h1>
              <p className="text-gray-500 text-sm">{filteredExpenses.length} transactions</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="text-gray-500" size={16} />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-[#2C3E50] shadow-sm' 
                : 'text-gray-500 hover:text-[#2C3E50]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unpaid' 
                ? 'bg-white text-[#2C3E50] shadow-sm' 
                : 'text-gray-500 hover:text-[#2C3E50]'
            }`}
          >
            Unpaid
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              filter === 'paid' 
                ? 'bg-white text-[#2C3E50] shadow-sm' 
                : 'text-gray-500 hover:text-[#2C3E50]'
            }`}
          >
            Paid
          </button>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">No transactions found</h3>
                <p className="text-gray-500 text-sm">
                  {filter === 'paid' && 'No paid transactions yet'}
                  {filter === 'unpaid' && 'No pending transactions'}
                  {filter === 'all' && 'No transactions yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredExpenses.map((expense) => {
              const amount = parseFloat(expense.amountPaidFor);
              const amountPaid = parseFloat(expense.amountPaid || "0");
              const isFullyPaid = expense.isPaid;
              const isPartiallyPaid = amountPaid > 0 && !isFullyPaid;

              return (
                <Card 
                  key={expense.id} 
                  className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleExpenseClick(expense.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <i className={`${getCategoryIcon(expense.category)} text-gray-600`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#2C3E50]">
                            {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Paid for <span className="font-medium">{expense.person.name}</span>
                          </p>
                          {expense.notes && (
                            <p className="text-xs text-gray-400 mt-1">{expense.notes}</p>
                          )}
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
                          {isPartiallyPaid && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-500">
                                Paid: {formatCurrency(amountPaid)} of {formatCurrency(amount)}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-[#F39C12] h-1.5 rounded-full"
                                  style={{ width: `${(amountPaid / amount) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#27AE60]">
                          +{formatCurrency(amount)}
                        </p>
                        {!isFullyPaid && (
                          <p className="text-xs text-gray-500 mt-1">
                            Remaining: {formatCurrency(amount - amountPaid)}
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
                            Partial
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
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Payment Modal */}
        <PaymentConfirmationModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          expense={selectedExpense}
        />

        {/* Expense Details Modal */}
        <ExpenseDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          expenseId={selectedExpenseId}
        />
      </div>
      
      <BottomNavigation />
    </div>
  );
}