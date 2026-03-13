import { Role } from "@prisma/client";

export const modulePermissions: Record<
  string,
  { read: Role[]; write: Role[]; admin?: Role[] }
> = {
  dashboard: { read: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER] },
  vehicles: { read: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER, Role.SALES] },
  customers: { read: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER, Role.SALES] },
  deals: { read: [Role.ADMIN, Role.MANAGER, Role.SALES], write: [Role.ADMIN, Role.MANAGER, Role.SALES] },
  finance: { read: [Role.ADMIN, Role.MANAGER, Role.SALES], write: [Role.ADMIN, Role.MANAGER] },
  invoices: { read: [Role.ADMIN, Role.MANAGER, Role.SALES], write: [Role.ADMIN, Role.MANAGER, Role.SALES] },
  warranties: { read: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER, Role.AFTERSALES] },
  aftersales: { read: [Role.ADMIN, Role.MANAGER, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER, Role.AFTERSALES] },
  locations: { read: [Role.ADMIN, Role.MANAGER, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER, Role.AFTERSALES] },
  tasks: { read: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES] },
  communications: { read: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES], write: [Role.ADMIN, Role.MANAGER, Role.SALES, Role.AFTERSALES] },
  reports: { read: [Role.ADMIN, Role.MANAGER], write: [Role.ADMIN, Role.MANAGER] },
  settings: { read: [Role.ADMIN, Role.MANAGER], write: [Role.ADMIN], admin: [Role.ADMIN] },
  users: { read: [Role.ADMIN], write: [Role.ADMIN], admin: [Role.ADMIN] },
};

export function canRead(role: Role, module: keyof typeof modulePermissions) {
  return modulePermissions[module].read.includes(role);
}

export function canWrite(role: Role, module: keyof typeof modulePermissions) {
  return modulePermissions[module].write.includes(role);
}

export function isAdmin(role: Role) {
  return role === Role.ADMIN;
}
