/**
 * Shared types for stat components
 */

import { type LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  /** Colours the icon: published notices are a success, drafts wait */
  tone?: 'success' | 'warning';
}

export interface StatCardSkeletonProps {
  title: string;
  icon?: LucideIcon;
}
