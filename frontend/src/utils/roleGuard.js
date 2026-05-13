export const ROLES = {
  ADMIN: 'Admin',
  AGENT: 'Agent',
  SUPERVISOR: 'Supervisor',
  CUSTOMER: 'Customer',
  QA: 'QualityTeam',
}

export function canAssign(role) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR].includes(role)
}

export function canEscalate(role) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.AGENT].includes(role)
}

export function canClose(role) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR].includes(role)
}

export function canViewAllComplaints(role) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.QA].includes(role)
}

export function canManageUsers(role) {
  return role === ROLES.ADMIN
}

export function canViewReports(role) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.QA].includes(role)
}
