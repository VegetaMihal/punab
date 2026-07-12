export type NamedCount = { name: string; value: number };

export type TimeBucketPoint = { bucket: string; count: number; cumulative: number };

export type StackedBucketPoint = { bucket: string; yes: number; no: number };

export type FunnelBucketPoint = { bucket: string; registered: number; checkedIn: number; confirmed: number };

export type JulyTrendsData = {
  registrationVolume: TimeBucketPoint[];
  repeatEmailBuckets: NamedCount[];
  repeatByCycle: { bucket: string; repeatCount: number }[];
  duplicateGapDays: NamedCount[];
  universityDistribution: NamedCount[];
  clubDistribution: NamedCount[];
  topRepeatUniversities: NamedCount[];
  roleDistribution: NamedCount[];
  bloodGroupDistribution: NamedCount[];
  donatesBloodByCycle: StackedBucketPoint[];
  martyrsPledgeByCycle: StackedBucketPoint[];
  sentimentFlipCount: number;
  attendanceFunnelByCycle: FunnelBucketPoint[];
  noShowRepeatCount: number;
  bloodGroupConflictCount: number;
  missingFieldsByCycle: { bucket: string; missingRate: number }[];
  totalRows: number;
  uniqueEmailCount: number;
  duplicateNameByDifferentEmailCount: number;
  topDuplicateNames: NamedCount[];
};
