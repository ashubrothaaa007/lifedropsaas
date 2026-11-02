import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

export const refreshLifeDrop: CollectionAfterChangeHook = ({ doc }) => {
  revalidateTag('lifedrop-home', 'max')
  return doc
}
export const deleteLifeDrop: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateTag('lifedrop-home', 'max')
  return doc
}
export const refreshVisuals: GlobalAfterChangeHook = ({ doc }) => {
  revalidateTag('lifedrop-home', 'max')
  return doc
}
