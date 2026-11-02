import type { Access, FieldAccess, PayloadRequest } from 'payload'

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const isAdmin = (user: PayloadRequest['user']) => user?.collection === 'admins'
export const isAppUser = (user: PayloadRequest['user']) => user?.collection === 'users'
export const isStaff = (user: PayloadRequest['user']) =>
  isAppUser(user) &&
  'role' in user! &&
  user.role === 'hospital' &&
  'hospitalVerified' in user! &&
  user.hospitalVerified === true
export const adminOnly: Access = ({ req }) => isAdmin(req.user)
export const adminField: FieldAccess = ({ req }) => isAdmin(req.user)
export const ownUser: Access = ({ req }) =>
  isAdmin(req.user) ? true : isAppUser(req.user) ? { id: { equals: req.user!.id } } : false
export const ownRecord: Access = ({ req }) =>
  isAdmin(req.user) ? true : isAppUser(req.user) ? { owner: { equals: req.user!.id } } : false
export const staffOwnRecord: Access = ({ req }) =>
  isAdmin(req.user) ? true : isStaff(req.user) ? { owner: { equals: req.user!.id } } : false
