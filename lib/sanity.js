import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'e70geg2k',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
