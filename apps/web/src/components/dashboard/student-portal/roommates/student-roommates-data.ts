export type StudentRoommateDetail = {
  id: string;
  name: string;
  initials: string;
  registrationNumber: string;
  department: string;
  course: string;
  academicYear: string;
  admissionYear: string;
  bedLabel: string;
  hostelName: string;
  blockName: string;
  floorLabel: string;
  roomNumber: string;
  isYou: boolean;
};

export type StudentRoommateCard = {
  id: string;
  isYou: boolean;
  name: string;
  registrationNumber: string;
  bedLabel: string;
  courseLine: string;
  initials: string;
  detail: StudentRoommateDetail;
};

export type StudentRoommatesSnapshot = {
  hasAllocation: boolean;
  roomStatus: 'Active' | 'Unassigned';
  roomNumber: string;
  hostelName: string;
  block: string;
  floor: string;
  capacity: number;
  occupants: number;
  availableBeds: number;
  roommates: StudentRoommateCard[];
  facilities: Array<{ id: string; label: string; available: boolean }>;
};
