import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, Receipt } from "lucide-react";
import type { Person, ExpenseWithPerson } from "@shared/schema";
import { format } from "date-fns";

interface PersonActivityParams {
  id: string;
}

export default function PersonActivity() {
  const params = useParams() as PersonActivityParams;
  const [, setLocation] = useLocation();
  const personId = params.id;

  // Get person details
  const { data: person, isLoading: isLoadingPerson } = useQuery<Person>({
    queryKey: ["/api/people", personId],
    queryFn: async () => {
      const response = await fetch(`/api/people/${personId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch person');
      }
      return response.json();
    },
    enabled: !!personId,
  });

  // Get person's expenses
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery<ExpenseWithPerson[]>({
    queryKey: ["/api/people", personId, "expenses"],
    queryFn: async () => {
      const response = await fetch(`/api/people/${personId}/expenses`);
      if (!response.ok) {
        throw new Error('Failed to fetch person expenses');
      }
      return response.json();
    },
    enabled: !!personId,
  });

  if (isLoadingPerson || isLoadingExpenses) {
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

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-600">Person not found</h1>
            <Button 
              onClick={() => setLocation('/friends')}
              className="mt-4 bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white"
            >
              Back to Friends
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amountPaidFor || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const paidAmount = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amountPaid || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100"
            onClick={() => setLocation('/friends')}
          >
            <ArrowLeft size={20} className="text-[#2C3E50]" />
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={person.avatar} 
              alt={person.name}
              className="object-cover"
            />
            <AvatarFallback 
              className="text-white font-semibold"
              style={{ backgroundColor: person.color }}
            >
              {person.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-[#2C3E50]">{person.name}</h1>
            <p className="text-gray-500 text-sm">{expenses.length} transactions</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 text-[#00D4AA] mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="font-semibold text-[#2C3E50]">₹{totalAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-1">Paid</p>
              <p className="font-semibold text-green-600">₹{paidAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="font-semibold text-red-600">₹{unpaidAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#2C3E50] mb-3">Activity History</h2>
          
          {expenses.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">No activity yet</h3>
                <p className="text-gray-500 text-sm">This person hasn't been involved in any expenses</p>
              </CardContent>
            </Card>
          ) : (
            expenses
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .map((expense) => (
                <Card key={expense.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#00D4AA]/10 rounded-full flex items-center justify-center">
                            <Receipt className="text-[#00D4AA]" size={14} />
                          </div>
                          <h3 className="font-semibold text-[#2C3E50]">{expense.category}</h3>
                          <Badge 
                            variant={expense.isPaid ? "default" : "destructive"}
                            className={expense.isPaid ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {expense.isPaid ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            <span>
                              {expense.createdAt 
                                ? format(new Date(expense.createdAt), "MMM dd, yyyy")
                                : "Date not available"
                              }
                            </span>
                          </div>
                          <div>Payment: {expense.paymentMethod}</div>
                          {expense.bankApp && <div>Bank: {expense.bankApp}</div>}
                          {expense.notes && <div>Notes: {expense.notes}</div>}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-[#2C3E50]">
                          ₹{isNaN(parseFloat(expense.amountPaidFor)) ? "0.00" : parseFloat(expense.amountPaidFor).toFixed(2)}
                        </p>
                        {expense.amountPaid && !isNaN(parseFloat(expense.amountPaid)) && parseFloat(expense.amountPaid) > 0 && (
                          <p className="text-sm text-green-600">
                            ₹{parseFloat(expense.amountPaid).toFixed(2)} paid
                          </p>
                        )}
                        {expense.paidAt && (
                          <p className="text-xs text-gray-500">
                            Paid on {format(new Date(expense.paidAt), "MMM dd")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
