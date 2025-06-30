'use client';
import { useRouter } from 'next/navigation';
import { DollarSign, Shield, PlusCircle, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@clerk/nextjs';
// import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

interface Policy {
  createdAt: string;
  quote?: {
    quoteNumber?: string;
  };
  // Add other relevant policy fields if needed elsewhere
}

interface Quote {
  id: string | number; // Assuming id is present for key prop
  createdAt: string;
  totalPremium?: number;
  quoteNumber?: string;
  status?: string;
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
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication first
    if (isLoaded && !isSignedIn) {
      router.replace('/admin/login');
      return;
    }

    async function fetchStats() {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        // Get authentication token
        const token = await getToken();

        // Fetch all policies and all quotes in parallel
        const [policiesRes, quotesRes] = await Promise.all([
          fetch(`${apiUrl}/policies`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }), // Changed from policy-list to policies
          fetch(`${apiUrl}/quotes?allQuotes=true`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }), // Fetches all quotes
        ]);

        if (!policiesRes.ok || !quotesRes.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }

        const policiesData = await policiesRes.json();
        const quotesData = await quotesRes.json();
        setPolicies(policiesData.policies || []);
        setQuotes(quotesData.quotes || []);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [router, isSignedIn, isLoaded, getToken]);

  // Memoize expensive calculations
  const { policyStats, quoteStats, revenueStats, recentQuotes, recentTransactions } =
    useMemo(() => {
      if (loading || (policies.length === 0 && quotes.length === 0)) {
        return {
          policyStats: { current: 0, prev: 0, change: 0 },
          quoteStats: { current: 0, prev: 0, change: 0 },
          revenueStats: { current: 0, prev: 0, change: 0 },
          recentQuotes: [],
          recentTransactions: [],
        };
      }

      const now = new Date();
      const currentPeriodStart = new Date(now);
      currentPeriodStart.setDate(now.getDate() - 30);
      const previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(currentPeriodStart.getDate() - 1);
      const previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 30);

      // --- Calculate Policy Stats ---
      const currentPolicies = policies.filter((policy) => {
        const policyDate = new Date(policy.createdAt);
        return policyDate >= currentPeriodStart;
      });
      const prevPolicies = policies.filter((policy) => {
        const policyDate = new Date(policy.createdAt);
        return policyDate >= previousPeriodStart && policyDate <= previousPeriodEnd;
      });
      const policyChange =
        prevPolicies.length === 0
          ? currentPolicies.length > 0
            ? 100
            : 0
          : Math.round(
              ((currentPolicies.length - prevPolicies.length) / prevPolicies.length) * 100,
            );

      // --- Calculate Quote Stats ---
      const currentQuotes = quotes.filter((quote) => {
        const quoteDate = new Date(quote.createdAt);
        return quoteDate >= currentPeriodStart;
      });
      const prevQuotes = quotes.filter((quote) => {
        const quoteDate = new Date(quote.createdAt);
        return quoteDate >= previousPeriodStart && quoteDate <= previousPeriodEnd;
      });
      const quoteChange =
        prevQuotes.length === 0
          ? currentQuotes.length > 0
            ? 100
            : 0
          : Math.round(((currentQuotes.length - prevQuotes.length) / prevQuotes.length) * 100);

      // --- Set Recent Quotes (Optimized for large datasets) ---
      const completedQuotes = quotes.filter((q: Quote) => q.status === 'COMPLETE');
      const mostRecentQuotes: Quote[] = [];
      const K = 5; // Number of recent quotes to display

      for (const quote of completedQuotes) {
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

      // --- Calculate Revenue Stats and Recent Transactions ---
      // Create a map of quote numbers that have policies
      const quoteNumbersWithPolicies = new Set(
        policies.map((policy: Policy) => policy.quote?.quoteNumber).filter(Boolean),
      );

      // Filter quotes that have corresponding policies and are COMPLETE
      const transactionQuotes = quotes.filter(
        (q: Quote) => q.status === 'COMPLETE' && quoteNumbersWithPolicies.has(q.quoteNumber),
      );

      // Get recent transactions (quotes with policies)
      const mostRecentTransactions: Quote[] = [];
      for (const quote of transactionQuotes) {
        const quoteDate = new Date(quote.createdAt).getTime();
        if (mostRecentTransactions.length < K) {
          mostRecentTransactions.push(quote);
          if (mostRecentTransactions.length === K) {
            mostRecentTransactions.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
          }
        } else {
          if (quoteDate > new Date(mostRecentTransactions[K - 1].createdAt).getTime()) {
            mostRecentTransactions[K - 1] = quote;
            mostRecentTransactions.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
          }
        }
      }
      if (mostRecentTransactions.length > 0 && mostRecentTransactions.length < K) {
        mostRecentTransactions.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }

      // Calculate revenue from transactions (quotes with policies)
      const currentRevenue = transactionQuotes
        .filter((q: Quote) => {
          const quoteDate = new Date(q.createdAt);
          return quoteDate >= currentPeriodStart;
        })
        .reduce((sum: number, q: Quote) => sum + (q.totalPremium || 0), 0);

      const prevRevenue = transactionQuotes
        .filter((q: Quote) => {
          const quoteDate = new Date(q.createdAt);
          return quoteDate >= previousPeriodStart && quoteDate <= previousPeriodEnd;
        })
        .reduce((sum: number, q: Quote) => sum + (q.totalPremium || 0), 0);

      const revenueChange =
        prevRevenue === 0
          ? currentRevenue > 0
            ? 100
            : 0
          : Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100);

      return {
        policyStats: {
          current: currentPolicies.length,
          prev: prevPolicies.length,
          change: policyChange,
        },
        quoteStats: {
          current: currentQuotes.length,
          prev: prevQuotes.length,
          change: quoteChange,
        },
        revenueStats: {
          current: currentRevenue,
          prev: prevRevenue,
          change: revenueChange,
        },
        recentQuotes: mostRecentQuotes,
        recentTransactions: mostRecentTransactions,
      };
    }, [policies, quotes, loading]);

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
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card
          title="Recent Transactions"
          subtitle="Latest Transactions"
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
            {recentTransactions.length === 0 ? (
              <div className="py-2 text-gray-500">No recent transactions</div>
            ) : (
              recentTransactions.map((quote) => (
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
                    <span className="text-gray-500 truncate">
                      {`${quote.policyHolder?.firstName || ''} ${quote.policyHolder?.lastName || ''}`.trim() ||
                        'Unknown Customer'}
                    </span>
                    <span className="font-medium mb-4 text-gray-800 ">
                      $
                      {(quote.totalPremium || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
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
