export type UserRole = 'viewer' | 'editor';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
}

export interface Collaborator {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  addedAt: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 or stored url
  uploadedAt: string;
  uploadedBy: string;
}

export interface DocumentVersion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  summary: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  plainText?: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  collaborators: Collaborator[];
  attachments: DocumentAttachment[];
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
}

export const SEEDED_USERS: User[] = [
  {
    id: "usr_swati",
    name: "Swati Jain",
    email: "swati2003jain@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Swati",
    title: "Candidate & Full Stack Product Engineer"
  },
  {
    id: "usr_alex",
    name: "Alex Rivera",
    email: "alex@ajaia.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    title: "Engineering Lead"
  },
  {
    id: "usr_taylor",
    name: "Taylor Kim",
    email: "taylor@ajaia.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
    title: "Product Designer"
  },
  {
    id: "usr_jordan",
    name: "Jordan Lee",
    email: "jordan@ajaia.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    title: "Security & Compliance"
  }
];
