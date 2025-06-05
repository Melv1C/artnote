/**
 * Shared types for stat components
 */

import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
}

export interface StatCardSkeletonProps {
  title: string;
  icon?: LucideIcon;
}
