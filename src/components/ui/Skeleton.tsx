import { cn } from '@/lib/common-utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded bg-gray-200", className)}
      {...props}
    />
  );
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-4 mb-2", className)}
      {...props}
    />
  );
}

export function SkeletonTitle({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-6 mb-3", className)}
      {...props}
    />
  );
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-11 w-full rounded-lg", className)}
      {...props}
    />
  );
}

export function SkeletonInput({ className, ...props }: SkeletonProps) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className={cn("h-11 w-full rounded-lg", className)} {...props} />
    </div>
  );
}

export function SkeletonCard({ className, children, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-4 md:p-6", className)} {...props}>
      {children}
    </div>
  );
}