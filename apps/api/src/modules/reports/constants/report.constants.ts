export const SUB_STATUS = {
  NONE: null,
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  FORWARDED: 'FORWARDED',
} as const;

export type SubStatus = (typeof SUB_STATUS)[keyof typeof SUB_STATUS];
