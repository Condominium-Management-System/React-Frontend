export const isSuperAdmin = (role?: string): boolean => {
  return role === 'super_admin'
}

export const isCondoAdmin = (role?: string): boolean => {
  return role === 'condo_admin'
}

export const canAccessWebConsole = (role?: string): boolean => {
  return isSuperAdmin(role) || isCondoAdmin(role)
}
