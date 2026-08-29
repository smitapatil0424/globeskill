export interface DonorTransaction {
  id: string;
  donorId?: string | null;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  projectId?: string | null;
  projectTitle?: string | null;
  projectCategory?: string | null;
  paymentMethod: string;
  paymentStatus: 'succeeded' | 'pending' | 'failed';
  transactionId?: string | null;
  message?: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

export interface DonorMetricsSummary {
  totalDonationsUSD: number;
  totalDonationsINR: number;
  allocatedCapitalUSD: number;
  availableCapitalUSD: number;
  totalTransactionsCount: number;
  allocatedTransactionsCount: number;
  unallocatedTransactionsCount: number;
}

export const DEFAULT_DONOR_SUMMARY: DonorMetricsSummary = {
  totalDonationsUSD: 58150,
  totalDonationsINR: 4825000,
  allocatedCapitalUSD: 37500,
  availableCapitalUSD: 20650,
  totalTransactionsCount: 5,
  allocatedTransactionsCount: 3,
  unallocatedTransactionsCount: 2,
};

export const DEFAULT_DONOR_TRANSACTIONS: DonorTransaction[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    donorId: 'd0000000-0000-0000-0000-000000000006',
    donorName: 'Elena Rostova',
    donorEmail: 'elena.rostova@philanthropy.org',
    amount: 5000,
    currency: 'USD',
    projectId: 'c0000000-0000-0000-0000-000000000002',
    projectTitle: 'AI Micro Degree',
    projectCategory: 'Artificial Intelligence',
    paymentMethod: 'stripe',
    paymentStatus: 'succeeded',
    transactionId: 'ch_seed_stripe_9876543210',
    message: 'Dedicated to funding AI compute credits and hardware kits for 25 high school learners.',
    isAnonymous: false,
    createdAt: '2026-08-23T12:00:00.000Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    donorId: null,
    donorName: 'Anonymous Benefactor',
    donorEmail: 'donor@communityfund.org',
    amount: 2500,
    currency: 'USD',
    projectId: null,
    projectTitle: null,
    projectCategory: null,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'succeeded',
    transactionId: 'wire_seed_global_88112233',
    message: 'General capital pool for digital divide bridging.',
    isAnonymous: true,
    createdAt: '2026-08-26T09:30:00.000Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    donorId: null,
    donorName: 'Global Education Futures Fund',
    donorEmail: 'contact@edufutures.org',
    amount: 12500,
    currency: 'USD',
    projectId: 'c0000000-0000-0000-0000-000000000001',
    projectTitle: 'IBM SkillsBuild - Frontend Development',
    projectCategory: 'Web Development',
    paymentMethod: 'stripe',
    paymentStatus: 'succeeded',
    transactionId: 'ch_stripe_edu_futures_102938',
    message: 'Earmarked for underserved youth laptops and mentorship stipends.',
    isAnonymous: false,
    createdAt: '2026-08-18T14:15:00.000Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    donorId: null,
    donorName: 'Silicon Valley Community Grant',
    donorEmail: 'grants@svcommunity.org',
    amount: 20000,
    currency: 'USD',
    projectId: 'c0000000-0000-0000-0000-000000000003',
    projectTitle: 'Certificate Program in IT',
    projectCategory: 'Information Technology',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'succeeded',
    transactionId: 'ach_sv_grant_99221144',
    message: 'Sponsoring vocational IT certifications across rural tech centers.',
    isAnonymous: false,
    createdAt: '2026-08-13T10:00:00.000Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    donorId: null,
    donorName: 'Tech Equity Philanthropies',
    donorEmail: 'partnerships@techequity.org',
    amount: 18150,
    currency: 'USD',
    projectId: null,
    projectTitle: null,
    projectCategory: null,
    paymentMethod: 'stripe',
    paymentStatus: 'succeeded',
    transactionId: 'ch_techequity_capital_556677',
    message: 'Discretionary funding for Tier 2 and Tier 3 high-speed connectivity.',
    isAnonymous: false,
    createdAt: '2026-08-21T16:45:00.000Z',
  },
];
