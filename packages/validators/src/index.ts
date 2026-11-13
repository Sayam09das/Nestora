export { auditListQuerySchema, auditLogIdParamsSchema, type AuditListQuery } from './audit.validator.js';
export {
  registerStaffBodySchema,
  staffDirectoryListQuerySchema,
  staffDirectoryStatusSchema,
  staffDocumentKindSchema,
  type RegisterStaffBody,
  type StaffDirectoryListQuery,
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
  financeDeskListQuerySchema,
  financeLedgerIdParamsSchema,
  type FinanceDeskListQuery,
} from './finance.validator.js';
export {
  assignComplaintTicketBodySchema,
  complaintTicketIdParamsSchema,
  complaintsDeskListQuerySchema,
  type AssignComplaintTicketBody,
  type ComplaintsDeskListQuery,
} from './complaints.validator.js';
export {
  leaveApplicationIdParamsSchema,
  leaveDeskListQuerySchema,
  type LeaveDeskListQuery,
} from './leaves.validator.js';
export {
  announcementIdParamsSchema,
  announcementsDeskListQuerySchema,
  type AnnouncementsDeskListQuery,
} from './announcements.validator.js';
export {
  reportPreviewQuerySchema,
  reportTemplateIdParamsSchema,
  reportsDeskListQuerySchema,
  type ReportsDeskListQuery,
} from './reports.validator.js';
export {
  settingsDeskListQuerySchema,
  settingsPanelIdParamsSchema,
  type SettingsDeskListQuery,
} from './settings.validator.js';
export {
  roleIdParamsSchema,
  rolesDeskListQuerySchema,
  type RolesDeskListQuery,
} from './roles.validator.js';
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
