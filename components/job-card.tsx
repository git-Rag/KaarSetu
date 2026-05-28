'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JobListing } from '@/lib/jobs';
import { MapPin, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

interface JobCardProps {
  job: JobListing;
  canApply: boolean;
}

export function JobCard({ job, canApply }: JobCardProps) {
  return (
    <Card className="transition-all duration-200 hover:border-saffron/30">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display font-bold text-cream">{job.title}</h4>
        {job.verified && <Badge variant="teal">Verified Employer</Badge>}
      </div>
      <p className="mt-1 text-sm text-text-secondary">{job.company}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-secondary">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee className="h-3.5 w-3.5" /> {job.wage}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-text-muted">{job.description}</p>
      <p className="mt-2 text-xs text-text-muted">
        NSQF {job.requiredNSQF}+ • {job.requiredTrade} • {job.applicants} applicants •{' '}
        {job.postedDaysAgo}d ago
      </p>
      <div className="mt-4">
        {canApply ? (
          <Button
            size="sm"
            onClick={() => toast.success('Application sent to employer')}
          >
            Apply Now
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled>
            Get Certified to Apply
          </Button>
        )}
      </div>
    </Card>
  );
}
