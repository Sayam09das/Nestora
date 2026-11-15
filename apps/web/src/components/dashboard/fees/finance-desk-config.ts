export type FinanceDeskConfig = {
  ledgerBasePath: string;
  canDecideWaivers: boolean;
  canProposeWaivers: boolean;
  canAssessFromSchedule: boolean;
  canSendReminder: boolean;
};

export const ADMIN_FINANCE_DESK: FinanceDeskConfig = {
  ledgerBasePath: '/admin/fees',
  canDecideWaivers: true,
  canProposeWaivers: true,
  canAssessFromSchedule: true,
  canSendReminder: true,
};

export const ACCOUNTANT_FINANCE_DESK: FinanceDeskConfig = {
  ledgerBasePath: '/accountant/fees',
  canDecideWaivers: false,
  canProposeWaivers: true,
  canAssessFromSchedule: true,
  canSendReminder: true,
};