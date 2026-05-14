// src/data/mockData.js

export const mockOfficers = [
  {
    id: "POL-7788",
    name: "Sgt. Bandara",
    email: "bandara@police.lk",
    password: "123",
    district: "Colombo"
  },
  {
    id: "POL-9922",
    name: "Insp. Silva",
    email: "silva@police.lk",
    password: "123",
    district: "Gampaha"
  }
];

export const mockFines = [
  {
    referenceNumber: "FIN-2026-8901",
    officerId: "POL-7788", // Issued by Bandara
    categoryIdentifier: "SPEEDING_OVER_20",
    categoryName: "Speeding",
    amount: 3000,
    status: "PAID",
    district: "Colombo",
    dateIssued: "2026-05-09T08:30:00Z",
    datePaid: "2026-05-09T09:15:00Z"
  },
  {
    referenceNumber: "FIN-2026-8902",
    officerId: "POL-9922", // Issued by Silva
    categoryIdentifier: "ILLEGAL_PARKING",
    categoryName: "Illegal Parking",
    amount: 1500,
    status: "PENDING",
    district: "Gampaha",
    dateIssued: "2026-05-10T11:45:00Z",
    datePaid: null
  },
  {
    referenceNumber: "FIN-2026-8903",
    officerId: "POL-7788", // Issued by Bandara
    categoryIdentifier: "NO_LICENSE",
    categoryName: "Driving Without License",
    amount: 25000,
    status: "PAID",
    district: "Kandy",
    dateIssued: "2026-05-08T14:20:00Z",
    datePaid: "2026-05-10T10:00:00Z"
  },
  {
    referenceNumber: "FIN-2026-8904",
    officerId: "POL-7788", // Issued by Bandara
    categoryIdentifier: "SPEEDING_OVER_20",
    categoryName: "Speeding",
    amount: 3000,
    status: "PENDING",
    district: "Colombo",
    dateIssued: "2026-05-10T16:10:00Z",
    datePaid: null
  }
];