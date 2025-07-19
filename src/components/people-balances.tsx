import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import type { PersonWithBalance } from "@shared/schema";
import { useLocation } from "wouter";

export default function PeopleBalances() {
  const [, setLocation] = useLocation();
  const { data: people, isLoading } = useQuery<PersonWithBalance[]>({
    queryKey: ["/api/people/balances"],
  });

  if (isLoading) {
    return (
      <section className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#2C3E50]">People</h2>
          <button className="text-[#00D4AA] text-sm font-medium">View All</button>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Filter people to only show those with non-zero balances
  const peopleWithBalances = people?.filter(person => person.netBalance !== 0) || [];

  return (
    <section className="px-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[#2C3E50]">People</h2>
        <button 
          onClick={() => setLocation('/friends')}
          className="text-[#00D4AA] text-sm font-medium hover:text-[#00D4AA]/80 transition-colors"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-2">
        {peopleWithBalances.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 text-sm">All settled up! No outstanding balances.</p>
          </div>
        ) : (
          peopleWithBalances.map((person) => {
            const isOwed = person.netBalance > 0;
            const isOwing = person.netBalance < 0;
            
            return (
              <div key={person.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transaction-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                      {person.avatar ? (
                        <img 
                          src={person.avatar} 
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{ backgroundColor: person.color }}
                        >
                          {person.initials}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#2C3E50]">{person.name}</p>
                      <p className="text-xs text-gray-500">
                        {person.transactionCount} transaction{person.transactionCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isOwed ? (
                      <div className="credit-indicator text-white px-3 py-1 rounded-full">
                        <span className="text-sm font-medium">
                          To Collect {formatCurrency(person.netBalance)}
                        </span>
                      </div>
                    ) : (
                      <div className="debt-indicator text-white px-3 py-1 rounded-full">
                        <span className="text-sm font-medium">
                          To Pay {formatCurrency(Math.abs(person.netBalance))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
