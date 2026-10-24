import type { Access, FieldAccess } from 'payload'

type U = { id: string; role?: string } | null | undefined

// Pages anyone may read must not sit behind the two-factor check. Writes and anything staff-only stay wrapped by the TOTP plugin.
export const publicRead = { totp: { disableAccessWrapper: { read: true } } }

export const isAdminU = (u: U) => u?.role === 'admin'
export const isStaffU = (u: U) => u?.role === 'admin' || u?.role === 'subadmin'

export const admin: Access = ({ req }) => isAdminU(req.user as U)
export const staff: Access = ({ req }) => isStaffU(req.user as U)
export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const anyone: Access = () => true

export const staffField: FieldAccess = ({ req }) => isStaffU(req.user as U)
export const adminField: FieldAccess = ({ req }) => isAdminU(req.user as U)

// staff: everything; writer: only docs whose `path` relation points at them
export const staffOrOwn =
  (path: string): Access =>
  ({ req }) => {
    const u = req.user as U
    if (isStaffU(u)) return true
    return u ? { [path]: { equals: u.id } } : false
  }
