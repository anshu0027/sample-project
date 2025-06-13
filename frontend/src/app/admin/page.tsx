'use client';
import { useRouter } from 'next/navigation';
import { DollarSign, Shield, PlusCircle, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
// import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Policy {
  createdAt: string;
  // Add other relevant policy fields if needed elsewhere
}

interface Quote {
  id: string | number; // Assuming id is present for key prop
  createdAt: string;
  totalPremium?: number;
  quoteNumber?: string;
  event?: {
    // Added for potentially nested eventType
    eventType?: string;
  };
  policyHolder?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  // Add other relevant quote fields if needed elsewhere
}

export default function AdminDashboard() {
  const router = useRouter();
  const [policyStats, setPolicyStats] = useState({ current: 0, prev: 0, change: 0 });
  const [quoteStats, setQuoteStats] = useState({ current: 0, prev: 0, change: 0 });
  const [revenueStats, setRevenueStats] = useState({ current: 0, prev: 0, change: 0 });
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]); // Will be used for "Recent Transactions" card
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        const now = new Date();
        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(now.getDate() - 30);
        const previousPeriodEnd = new Date(currentPeriodStart);
        previousPeriodEnd.setDate(currentPeriodStart.getDate() - 1);
        const previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setDate(previousPeriodEnd.getDate() - 30);

        // Fetch all policies and all quotes in parallel
        const [policiesRes, quotesRes] = await Promise.all([
          fetch(`${apiUrl}/policy-list`), // Fetches all policies
          fetch(`${apiUrl}/quotes?allQuotes=true`), // Fetches all quotes
        ]);

        if (!policiesRes.ok || !quotesRes.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }

        const policiesData = await policiesRes.json();
        const quotesData = await quotesRes.json();
        const policies: Policy[] = policiesData.policies || [];
        const quotes: Quote[] = quotesData.quotes || [];

        // --- Calculate Policy Stats ---
        const currentPolicies = policies.filter(
          (p: Policy) => new Date(p.createdAt) >= currentPeriodStart,
        );
        const prevPolicies = policies.filter(
          (p: Policy) =>
            new Date(p.createdAt) >= previousPeriodStart &&
            new Date(p.createdAt) <= previousPeriodEnd,
        );
        const policyChange =
          (prevPolicies.length || 0) === 0
            ? currentPolicies.length > 0
              ? 100
              : 0
            : parseFloat(
                (
                  ((currentPolicies.length - prevPolicies.length) / prevPolicies.length) *
                  100
                ).toFixed(1),
              );
        setPolicyStats({
          current: currentPolicies.length,
          prev: prevPolicies.length,
          change: policyChange,
        });

        // --- Calculate Quote Stats ---
        const currentQuotes = quotes.filter(
          (q: Quote) => new Date(q.createdAt) >= currentPeriodStart,
        );
        const prevQuotes = quotes.filter(
          (q: Quote) =>
            new Date(q.createdAt) >= previousPeriodStart &&
            new Date(q.createdAt) <= previousPeriodEnd,
        );
        const quoteChange =
          (prevQuotes.length || 0) === 0
            ? currentQuotes.length > 0
              ? 100
              : 0
            : parseFloat(
                (((currentQuotes.length - prevQuotes.length) / prevQuotes.length) * 100).toFixed(1),
              );
        setQuoteStats({
          current: currentQuotes.length,
          prev: prevQuotes.length,
          change: quoteChange,
        });

        // --- Set Recent Quotes (Optimized for large datasets) ---
        const mostRecentQuotes: Quote[] = [];
        const K = 5; // Number of recent quotes to display

        for (const quote of quotes) {
          const quoteDate = new Date(quote.createdAt).getTime();
          if (mostRecentQuotes.length < K) {
            mostRecentQuotes.push(quote);
            // Sort the small array after adding, to keep the oldest at the end if we reach K items
            if (mostRecentQuotes.length === K) {
              mostRecentQuotes.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              );
            }
          } else {
            // Compare with the oldest in the current top K (at index K-1 due to descending sort)
            if (quoteDate > new Date(mostRecentQuotes[K - 1].createdAt).getTime()) {
              mostRecentQuotes[K - 1] = quote; // Replace the oldest
              mostRecentQuotes.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              ); // Re-sort
            }
          }
        }
        // If there were fewer than K quotes in total, ensure the array is sorted.
        if (mostRecentQuotes.length > 0 && mostRecentQuotes.length < K) {
          mostRecentQuotes.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        }
        setRecentQuotes(mostRecentQuotes);

        // --- Calculate Revenue Stats ---
        const currentRevenue = currentQuotes.reduce(
          (sum: number, q: Quote) => sum + (q.totalPremium || 0),
          0,
        );
        const prevRevenue = prevQuotes.reduce(
          (sum: number, q: Quote) => sum + (q.totalPremium || 0),
          0,
        );
        const revenueChange =
          (prevRevenue || 0) === 0
            ? currentRevenue > 0
              ? 100
              : 0
            : parseFloat(
                (((currentRevenue - prevRevenue) / (Math.abs(prevRevenue) || 1)) * 100).toFixed(1),
              );
        setRevenueStats({ current: currentRevenue, prev: prevRevenue, change: revenueChange });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Skeleton Components
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-200 rounded-lg h-10 w-10"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  const RecentListItemSkeleton = () => (
    <div className="py-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-3/5"></div>
        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="h-4 bg-gray-200 rounded w-2/5"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/4 mt-1 ml-auto"></div>
    </div>
  );

  const RecentListSkeleton = ({ itemCount = 3 }) => (
    <div className="divide-y divide-gray-100">
      {[...Array(itemCount)].map((_, i) => (
        <RecentListItemSkeleton key={i} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Quotes" className="text-gray-800" icon={<Clock size={20} />}>
            <RecentListSkeleton />
          </Card>
          <Card
            title="Recent Transactions"
            className="text-gray-800"
            icon={<DollarSign size={20} />}
          >
            <RecentListSkeleton />
          </Card>
        </div>
      </div>
    );
  }

  function generateTransactionId(quoteNum: string | null | undefined): string {
    if (quoteNum && quoteNum.startsWith('Q')) {
      const lastSegment = quoteNum.split('-').pop() || '';
      return 'T-' + lastSegment;
    }
    return quoteNum || 'N/A';
  }

  const stats = [
    {
      title: 'Total Policies',
      value: policyStats.current,
      change: `${policyStats.change > 0 ? '+' : ''}${policyStats.change}%`,
      trend: policyStats.change >= 0 ? 'up' : 'down',
      icon: <Shield className="text-blue-600" size={24} />,
      onClick: () => router.push('/admin/policies'),
    },
    {
      title: 'Total Quotes',
      value: quoteStats.current,
      change: `${quoteStats.change > 0 ? '+' : ''}${quoteStats.change}%`,
      trend: quoteStats.change >= 0 ? 'up' : 'down',
      icon: <Clock className="text-purple-600" size={24} />,
      onClick: () => router.push('/admin/quotes'),
    },
    {
      title: 'Premium Revenue',
      value: `$${revenueStats.current.toLocaleString()}`,
      change: `${revenueStats.change > 0 ? '+' : ''}${revenueStats.change}%`,
      trend: revenueStats.change >= 0 ? 'up' : 'down',
      icon: <DollarSign className="text-emerald-600" size={24} />,
      onClick: () => router.push('/admin/transactions'),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of insurance policies and events</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {/* <Button variant="primary" onClick={() => router.push('/admin/create-quote/step1')}>
            <PlusCircle size={18} />
            Generate Policy
          </Button> */}
          <Button
            variant="outline"
            onClick={() => router.push('/admin/create-quote/step1')}
            onMouseEnter={() => router.prefetch('/admin/create-quote/step1')}
          >
            <PlusCircle size={18} />
            Create Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={stat.onClick}
            onMouseEnter={() => {
              if (stat.title === 'Total Policies') router.prefetch('/admin/policies');
              if (stat.title === 'Total Quotes') router.prefetch('/admin/quotes');
              if (stat.title === 'Premium Revenue') router.prefetch('/admin/transactions');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
              <span
                className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent Quotes"
          subtitle="Latest quotes created"
          icon={<Clock size={20} />}
          className="text-gray-800"
          footer={
            <div className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/quotes')}
                onMouseEnter={() => router.prefetch('/admin/quotes')}
              >
                View All Quotes
              </Button>
            </div>
          }
        >
          <div className="divide-y divide-gray-100">
            {recentQuotes.length === 0 ? (
              <div className="py-3 text-gray-500">No recent quotes</div>
            ) : (
              recentQuotes.map((quote) => (
                <div key={quote.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{quote.quoteNumber}</p>
                    <p className="text-sm text-gray-500">
                      {quote.event?.eventType || 'Wedding Event'} • Premium: $
                      {quote.totalPremium || 0}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(quote.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card
          title="Recent Transactions"
          subtitle="Latest quote activities"
          icon={<DollarSign size={20} />}
          className="text-gray-800"
          footer={
            <div className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/transactions')}
                onMouseEnter={() => router.prefetch('/admin/transactions')}
              >
                View All Transactions
              </Button>
            </div>
          }
        >
          <div className="divide-y divide-gray-100">
            {recentQuotes.length === 0 ? (
              <div className="py-2 text-gray-500">No recent transactions</div>
            ) : (
              recentQuotes.map((quote) => (
                <div key={quote.id || quote.quoteNumber} className="py-1">
                  <div className="flex items-center justify-between">
                    <p
                      className="font-medium text-gray-900 truncate"
                      title={generateTransactionId(quote.quoteNumber)}
                    >
                      {generateTransactionId(quote.quoteNumber)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className="text-gray-500 truncate"
                      title={
                        `${quote.policyHolder?.firstName || ''} ${quote.policyHolder?.lastName || ''}`.trim() ||
                        'Unknown Customer'
                      }
                    >
                      {`${quote.policyHolder?.firstName || ''} ${quote.policyHolder?.lastName || ''}`.trim() ||
                        'Unknown Customer'}
                    </span>
                    <span className="font-medium text-gray-800">
                      $
                      {(quote.totalPremium || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
