import { Calculator } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#00D4AA] rounded-lg flex items-center justify-center">
            <Calculator className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-xl font-semibold text-[#2C3E50]">MyMeghMoney</h1>
        </div>
      </div>
    </header>
  );
}
