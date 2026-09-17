export interface PlanFeatureResponse {
  code: string;
  name: string;
  enabled: boolean;
  limit?: number | null;
  unlimited: boolean;
}

export interface PlanPriceResponseV2 {
  id: string;
  amountMinor: number;
  currency: string;
  durationDays: number;
  interviewQuota: number;
  features: PlanFeatureResponse[];
}

export interface PlanResponseV2 {
  id: string;
  code: string;
  name: string;
  description: string;
  badge?: string | null;
  isHighlighted: boolean;
  prices: PlanPriceResponseV2[];
}

export interface CheckoutFieldResponse {
  name: string;
  value: string;
}

export interface CheckoutActionResponse {
  method: string;
  url: string;
  fields: CheckoutFieldResponse[];
}

export interface CheckoutResponse {
  orderId: string;
  status: string;
  amountMinor: number;
  currency: string;
  provider: string;
  checkout?: CheckoutActionResponse | null;
}

export interface CheckoutStatusResponse {
  orderId: string;
  planCode: string;
  amountMinor: number;
  currency: string;
  provider: string;
  status: string;
  checkout?: CheckoutActionResponse | null;
  createdAt: string;
  updatedAt: string;
}
