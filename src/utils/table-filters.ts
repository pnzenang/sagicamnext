import type { ColumnFiltersState } from '@tanstack/react-table'

export const nameSearchColumnId = 'nameSearch'

type NameSearchSource = {
  firstName?: string | null
  lastAndMiddleNames?: string | null
}

const legacyNameSearchColumnIds = new Set(['firstName', 'lastAndMiddleNames'])

export const getNameSearchValue = ({ firstName, lastAndMiddleNames }: NameSearchSource) =>
  [firstName, lastAndMiddleNames, lastAndMiddleNames, firstName].filter(Boolean).join(' ')

export const normalizeNameColumnFilters = (columnFilters: ColumnFiltersState): ColumnFiltersState => {
  const filtersWithoutLegacyNameSearch = columnFilters.filter(filter => !legacyNameSearchColumnIds.has(filter.id))

  if (filtersWithoutLegacyNameSearch.some(filter => filter.id === nameSearchColumnId)) {
    return filtersWithoutLegacyNameSearch
  }

  const legacyNameSearchValues = columnFilters
    .filter(filter => legacyNameSearchColumnIds.has(filter.id))
    .map(filter => String(filter.value ?? '').trim())
    .filter(Boolean)

  if (legacyNameSearchValues.length === 0) {
    return filtersWithoutLegacyNameSearch
  }

  return [
    {
      id: nameSearchColumnId,
      value: legacyNameSearchValues.join(' ')
    },
    ...filtersWithoutLegacyNameSearch
  ]
}
