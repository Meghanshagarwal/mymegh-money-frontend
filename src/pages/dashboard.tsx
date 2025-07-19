import { useState } from "react";
import AppHeader from "@/components/app-header";
import BalanceOverview from "@/components/balance-overview";
import PeopleBalances from "@/components/people-balances";
import RecentTransactions from "@/components/recent-transactions";
import AddExpenseModal from "@/components/add-expense-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  return (
    <div className="bg-[#F8F9FA] font-sans min-h-screen pb-20">
      <AppHeader />
      
      <main className="max-w-md mx-auto bg-white min-h-screen">
        <BalanceOverview />
        <PeopleBalances />
        <RecentTransactions />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6">
        <Button
          className="w-14 h-14 bg-[#00D4AA] text-white rounded-full shadow-lg hover:bg-[#00D4AA]/90 transition-all duration-200 hover:scale-105 p-0"
          onClick={() => setIsAddExpenseModalOpen(true)}
        >
          <Plus size={24} />
        </Button>
      </div>

      <BottomNavigation />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
      />
    </div>
  );
}
