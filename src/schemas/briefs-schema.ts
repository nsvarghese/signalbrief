import type { CollectionSchema } from 'deepspace/schema'

export const briefsSchema: CollectionSchema = {
  name: 'briefs',
  columns: ['domain', 'seller', 'criteriaJson', 'sourcesJson', 'reportJson', 'draft', 'warningsJson'].map(name => ({ name, storage: 'text' as const, interpretation: 'plain' as const, required: !['reportJson', 'draft'].includes(name) })),
  permissions: {
    '*': { read: false, create: false, update: false, delete: false },
    member: { read: 'own', create: false, update: 'own', delete: 'own' },
    admin: { read: 'own', create: false, update: 'own', delete: 'own' },
  },
}

// Only server actions can create reservations. Uniqueness is enforced in the DO.
export const researchQuotaSchema: CollectionSchema = {
  name: 'research-quota',
  columns: [{ name: 'key', storage: 'text', interpretation: 'plain', required: true }],
  uniqueOn: ['key'],
  permissions: { '*': { read: false, create: false, update: false, delete: false }, member: { read: false, create: false, update: false, delete: false }, admin: { read: false, create: false, update: false, delete: false } },
}

