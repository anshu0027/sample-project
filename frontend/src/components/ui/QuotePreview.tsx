import React from 'react';
import { useQuote } from '@/context/QuoteContext';
import { FileText } from 'lucide-react';

const QuotePreview: React.FC = () => {
    const { state } = useQuote();

    if (!state.quoteNumber) {
        return (
            <aside className="w-full max-w-xs sticky top-6">
                <div className="rounded-2xl shadow-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 flex flex-col items-center">
                    <FileText size={32} className="text-gray-300 mb-2" />
                    <div className="text-gray-400 text-sm">No quote generated yet.</div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-full max-w-xl sticky top-6">
            <div className="rounded-2xl shadow-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={24} className="text-blue-500" />
                    <h3 className="text-lg font-bold text-blue-800 tracking-tight">Quote Preview</h3>
                </div>
                <div className="mb-4 text-sm space-y-1">
                    <div><span className="font-semibold text-blue-700">Quote #:</span> {state.quoteNumber}</div>
                    <div><span className="font-semibold">Event Type:</span> {state.eventType}</div>
                    <div><span className="font-semibold">Event Date:</span> {state.eventDate}</div>
                    <div><span className="font-semibold">Max Guests:</span> {state.maxGuests}</div>
                    <div><span className="font-semibold">Coverage Level:</span> {state.coverageLevel}</div>
                    <div><span className="font-semibold">Liability:</span> {state.liabilityCoverage}</div>
                    <div><span className="font-semibold">Liquor Liability:</span> <span className={state.liquorLiability ? 'text-green-600' : 'text-gray-500'}>{state.liquorLiability ? 'Yes' : 'No'}</span></div>
                </div>
                <div className="border-t pt-3 mt-3 text-sm space-y-1">
                    <div><span className="font-semibold">Base Premium:</span> <span className="text-blue-700">${state.basePremium.toFixed(2)}</span></div>
                    <div><span className="font-semibold">Liability Premium:</span> <span className="text-blue-700">${state.liabilityPremium.toFixed(2)}</span></div>
                    <div><span className="font-semibold">Liquor Premium:</span> <span className="text-blue-700">${state.liquorLiabilityPremium.toFixed(2)}</span></div>
                    <div className="font-bold text-xl mt-2 text-blue-900 flex items-center gap-2">
                        <span>Total:</span> <span>${state.totalPremium.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default QuotePreview; 