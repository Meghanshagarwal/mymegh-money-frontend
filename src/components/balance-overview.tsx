import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TotalBalances {
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
}

export default function BalanceOverview() {
  const { data: balances, isLoading } = useQuery<TotalBalances>({
    queryKey: ["/api/balances"],
  });

  if (isLoading) {
    return (
      <section className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-[#00D4AA] to-[#00D4AA]/80 rounded-2xl p-6 text-white animate-pulse">
          <div className="text-center">
            <div className="h-4 bg-white/20 rounded mb-2 w-24 mx-auto"></div>
            <div className="h-8 bg-white/20 rounded mb-2 w-32 mx-auto"></div>
            <div className="h-3 bg-white/20 rounded w-28 mx-auto"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  const totalBalance = balances?.netBalance || 0;
  const isPositive = totalBalance >= 0;

  return (
    <section className="p-4 space-y-4">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-[#00D4AA] to-[#00D4AA]/80 rounded-2xl p-6 text-white">
        <div className="text-center">
          <p className="text-sm opacity-90 mb-1">Total Balance</p>
          <p className="text-3xl font-bold">{formatCurrency(Math.abs(totalBalance))}</p>
          <p className="text-sm opacity-75 mt-2">
            {isPositive ? "To Collect overall" : "To Pay overall"}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#27AE60]/10 rounded-lg flex items-center justify-center">
              <ArrowDown className="text-[#27AE60] text-sm" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">To Collect</p>
              <p className="text-lg font-semibold text-[#27AE60]">
                {formatCurrency(balances?.totalOwed || 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center">
              <ArrowUp className="text-[#FF6B6B] text-sm" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">To Pay</p>
              <p className="text-lg font-semibold text-[#FF6B6B]">
                {formatCurrency(balances?.totalOwing || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
