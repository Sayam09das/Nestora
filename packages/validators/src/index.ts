export {
  auditListQuerySchema,
  auditLogIdParamsSchema,
  type AuditListQuery,
} from './audit.validator.js';
export {
  registerStaffBodySchema,
  staffDirectoryListQuerySchema,
  staffDirectoryStatusSchema,
  staffDocumentKindSchema,
  updateStaffHostelAssignmentsBodySchema,
  type RegisterStaffBody,
  type StaffDirectoryListQuery,
  type UpdateStaffHostelAssignmentsBody,
} from './staff.validator.js';
export {
  registerStudentBodySchema,
  studentDirectoryListQuerySchema,
  studentDirectoryStatusSchema,
  type RegisterStudentBody,
  type StudentDirectoryListQuery,
} from './students.validator.js';
export {
  roomDirectoryListQuerySchema,
  roomDirectoryOccupancyFilterSchema,
  roomDirectoryOperationalStatusSchema,
  type RoomDirectoryListQuery,
} from './rooms.validator.js';
export {
  bedDirectoryListQuerySchema,
  bedDirectoryUiStatusSchema,
  type BedDirectoryListQuery,
} from './beds.validator.js';
export {
  roomTypeDirectoryListQuerySchema,
  roomTypeStatusSchema,
  type RoomTypeDirectoryListQuery,
} from './room-types.validator.js';
export {
  hostelDirectoryListQuerySchema,
  hostelDirectoryStatusSchema,
  type HostelDirectoryListQuery,
} from './hostels.validator.js';
export {
  admissionApplicationIdParamsSchema,
  admissionTierVerificationBodySchema,
  admissionVerificationDecisionSchema,
  type AdmissionTierVerificationBody,
} from './admissions.validator.js';
export {
  accountantClearanceBodySchema,
  checkOutRequestIdParamsSchema,
  createCheckOutRequestBodySchema,
  finalizeCheckOutBodySchema,
  rejectCheckOutBodySchema,
  wardenCheckInBodySchema,
  wardenCheckOutListQuerySchema,
  type AccountantClearanceBody,
  type CreateCheckOutRequestBody,
  type FinalizeCheckOutBody,
  type RejectCheckOutBody,
  type WardenCheckInBody,
} from './checkin-out.validator.js';
export {
  approveRoomChangeBodySchema,
  createRoomChangeBodySchema,
  rejectRoomChangeBodySchema,
  roomChangeIdParamsSchema,
  type ApproveRoomChangeBody,
  type CreateRoomChangeBody,
} from './room-change.validator.js';
export {
  allocationDirectoryListQuerySchema,
  allocationDirectoryStatusSchema,
  allocationDirectoryTypeSchema,
  assignStudentToBedBodySchema,
  type AllocationDirectoryListQuery,
  type AssignStudentToBedBody,
} from './allocations.validator.js';
export {
  clearNightAttendanceMarkBodySchema,
  nightAttendanceSessionQuerySchema,
  upsertNightAttendanceMarkBodySchema,
  type ClearNightAttendanceMarkBody,
  type NightAttendanceSessionQuery,
  type UpsertNightAttendanceMarkBody,
} from './attendance.validator.js';
export {
  createStudentLeaveBodySchema,
  leaveApplicationIdParamsSchema,
  leaveDecisionBodySchema,
  leaveDeskListQuerySchema,
  leaveIdParamsSchema,
  studentLeaveTypeSchema,
  type CreateStudentLeaveBody,
  type LeaveDecisionBody,
  type LeaveDeskListQuery,
} from './leaves.validator.js';
export {
  createStudentOutingBodySchema,
  outingDecisionBodySchema,
  outingDeskListQuerySchema,
  outingIdParamsSchema,
  type CreateStudentOutingBody,
  type OutingDecisionBody,
  type OutingDeskListQuery,
} from './outings.validator.js';
export {
  createStudentVisitorBodySchema,
  registerVisitorBodySchema,
  studentVisitorIdProofSchema,
  visitorDeskListQuerySchema,
  visitorIdParamsSchema,
  visitorRejectBodySchema,
  type CreateStudentVisitorBody,
  type RegisterVisitorBody,
  type VisitorDeskListQuery,
} from './visitors.validator.js';
export {
  assignComplaintTicketBodySchema,
  complaintTicketIdParamsSchema,
  complaintsDeskListQuerySchema,
  createStudentComplaintBodySchema,
  createStudentMaintenanceBodySchema,
  studentComplaintCategorySchema,
  studentComplaintPrioritySchema,
  studentMaintenanceCategorySchema,
  type AssignComplaintTicketBody,
  type ComplaintsDeskListQuery,
  type CreateStudentComplaintBody,
  type CreateStudentMaintenanceBody,
} from './complaints.validator.js';
export {
  incidentActionBodySchema,
  incidentIdParamsSchema,
  incidentsDeskListQuerySchema,
  patchIncidentSeverityBodySchema,
  resolveIncidentBodySchema,
  staffReportIncidentBodySchema,
  studentReportIncidentBodySchema,
  type IncidentActionBody,
  type IncidentsDeskListQuery,
  type PatchIncidentSeverityBody,
  type ResolveIncidentBody,
  type StaffReportIncidentBody,
  type StudentReportIncidentBody,
} from './incidents.validator.js';
export {
  announcementIdParamsSchema,
  announcementsDeskListQuerySchema,
  studentAcknowledgeNoticeBodySchema,
  type AnnouncementsDeskListQuery,
  type StudentAcknowledgeNoticeBody,
} from './announcements.validator.js';
export {
  staffNotificationPreferencesBodySchema,
  type StaffNotificationPreferencesBody,
} from './staff-settings.validator.js';
export {
  studentNotificationPreferencesBodySchema,
  type StudentNotificationPreferencesBody,
} from './student-settings.validator.js';
export {
  createStudentHelpRequestBodySchema,
  type CreateStudentHelpRequestBody,
} from './help.validator.js';
export {
  guardGateLookupBodySchema,
  guardGatePassActionBodySchema,
  type GuardGateLookupBody,
  type GuardGatePassActionBody,
} from './guard-gate.validator.js';
export {
  notificationIdParamsSchema,
  notificationListQuerySchema,
  type NotificationListQuery,
} from './notifications.validator.js';
export {
  reportIdParamsSchema,
  reportPreviewQuerySchema,
  reportTemplateIdParamsSchema,
  reportsDeskListQuerySchema,
  type ReportsDeskListQuery,
} from './reports.validator.js';
export {
  decideFeeAdjustmentBodySchema,
  feeAdjustmentIdParamsSchema,
  financeDeskListQuerySchema,
  financeLedgerIdParamsSchema,
  proposeFeeWaiverBodySchema,
  recordOfflinePaymentBodySchema,
  type DecideFeeAdjustmentBody,
  type FinanceDeskListQuery,
  type ProposeFeeWaiverBody,
  type RecordOfflinePaymentBody,
} from './finance.validator.js';
export {
  roleIdParamsSchema,
  rolesDeskListQuerySchema,
  type RolesDeskListQuery,
} from './roles.validator.js';
export {
  dailyRegisterDeskQuerySchema,
  type DailyRegisterDeskQuery,
} from './daily-register.validator.js';
export {
  updateSelfProfileBodySchema,
  type UpdateSelfProfileBody,
} from './account.validator.js';
export {
  updateStudentSelfProfileBodySchema,
  type UpdateStudentSelfProfileBody,
} from './student-self-profile.validator.js';
export {
  patchSettingsPanelBodySchema,
  settingsDeskListQuerySchema,
  settingsPanelIdParamsSchema,
  type SettingsDeskListQuery,
} from './settings.validator.js';
export {
  activateAccountBodySchema,
  adminAuthActivityQuerySchema,
  adminListUsersQuerySchema,
  adminSetTemporaryPasswordBodySchema,
  adminUpdateUserRoleBodySchema,
  adminUpdateUserStatusBodySchema,
  changePasswordBodySchema,
  emailOnlyBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  provisionUserBodySchema,
  resetPasswordLinkBodySchema,
  mfaDisableBodySchema,
  mfaVerifyBodySchema,
  registerBodySchema,
  resendOtpBodySchema,
  resetPasswordBodySchema,
  roleEnumSchema,
  sessionIdParamsSchema,
  userIdParamsSchema,
  userStatusSchema,
  verifyEmailBodySchema,
  verifyPasswordResetOtpBodySchema,
  verifyRegistrationOtpBodySchema,
  type LoginBody,
  type RegisterBody,
} from './auth.validator.js';
export {
  bedIdParamsSchema,
  bedStatusSchema,
  blockIdParamsSchema,
  buildingIdParamsSchema,
  createBedBodySchema,
  createBlockBodySchema,
  createBuildingBodySchema,
  createFloorBodySchema,
  createHostelBodySchema,
  createRoomBodySchema,
  createUniversityBodySchema,
  floorIdParamsSchema,
  genderCategorySchema,
  hostelIdParamsSchema,
  infrastructurePaginationQuerySchema,
  listHostelsQuerySchema,
  roomIdParamsSchema,
  roomStatusSchema,
  universityIdParamsSchema,
  updateBedBodySchema,
  updateBlockBodySchema,
  updateBuildingBodySchema,
  updateFloorBodySchema,
  updateHostelBodySchema,
  updateRoomBodySchema,
  updateUniversityBodySchema,
  type CreateUniversityBody,
} from './infrastructure.validator.js';
