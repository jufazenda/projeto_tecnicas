
const Table = <T,>({
  collapsible,
  isLoading,
  headerTitle,
  headerSubtitle,
  columnTitles,
  rows,
  rowOptions,
  dropdownOptions,
  selectItems,
  collapsibleDiv,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onSortChange,
  filterClear,
  disableSorting,
}: TableProps<T>) => {
  const [selectAllItems, setSelectAllItems] = useState(false)
  const [selectedItems, setSelectedItems] = useState<boolean[]>([])
  const [sortedColumn, setSortedColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isOpenCollapsible, setIsOpenCollapsible] = useState<boolean[]>([])

  useEffect(() => {
    setSelectedItems(Array(rows.length).fill(false))
  }, [rows.length])

  const handleSelectAllItems = (isChecked: boolean) => {
    setSelectAllItems(isChecked)
    setSelectedItems(Array(rows.length).fill(isChecked))
  }

  const handleSelectItem = (index: number, isChecked: boolean) => {
    const updatedSelectedItems = [...selectedItems]
    updatedSelectedItems[index] = isChecked
    setSelectedItems(updatedSelectedItems)
    setSelectAllItems(updatedSelectedItems.every(Boolean))
  }

  const handleSort = (index: string) => {
    const newDirection = sortedColumn === index && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortedColumn(index)
    setSortDirection(newDirection)
    onSortChange?.(index, newDirection)
  }

  const getNestedValue = (obj: any, path: string) =>
    path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '-'

  const toggleCollapsible = (index: number) => {
    setIsOpenCollapsible(prev => {
      const updated = [...prev]
      updated[index] = !updated[index]
      return updated
    })
  }

  const hasCollapsible = (row: T) => {
    if (!collapsible) return false
    const value = (row as any)[collapsible]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  }

  return (
    <div className='relative bg-white rounded'>
      <div className='flex items-center justify-between p-4 border-gray-200 bg-white rounded-t'>
        <div className='flex flex-col gap-1'>
          <span className='text-lg font-semibold text-blue-warm-vivid-90'>{headerTitle}</span>
          <span className='text-sm text-gray-30'>{headerSubtitle}</span>
        </div>
        <div className='flex items-center space-x-2'>
          {dropdownOptions.length <= 4 ? (
            dropdownOptions.map((option, index) => (
              <Button
                key={index}
                icon={option.icon}
                title={option.title || ''}
                variant='tertiary'
                size='sm'
                onClick={() => option.onClick?.(option.value as T)}
              />
            ))
          ) : (
            <DropdownOptions icon={faEllipsis} options={dropdownOptions} onSelect={() => {}} />
          )}
        </div>
      </div> <div className='overflow-x-auto overflow-y-auto'>
        <table className='min-w-full divide-y divide-gray-200 '>
          <thead className='bg-gray-table'>
            <tr>
              {<th className='w-10 px-4'></th>}
              {selectItems && (
                <th className='w-10 px-4'>
                  <Checkbox
                    checked={selectAllItems}
                    onChange={handleSelectAllItems}
                    id='all-items'
                  />
                </th>
              )}

              {columnTitles.map((title, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-sm font-semibold tracking-wider text-blue-warm-vivid-70
                    ${!disableSorting ? 'cursor-pointer hover:bg-blue-warm-vivid-70 hover:bg-opacity-15' : ''}
                    ${sortedColumn === title.field ? 'bg-blue-warm-vivid-70 bg-opacity-15' : '' }`}
                  onClick={!disableSorting ? () => handleSort(String(title.field)) : undefined}
                >
                  <div className='flex items-center justify-between relative'>
                    {title.header}
                    {/* Ícone de ordenação só aparece se disableSorting for false */}
                    {!disableSorting && sortedColumn === title.field && (
                      <span className='ml-2'>
                        {sortDirection === 'asc' ? (
                          <FontAwesomeIcon icon={faCaretUp} />
                        ) : (
                          <FontAwesomeIcon icon={faCaretDown} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {rowOptions && (
                <th className='w-16 py-3 px-6 text-center text-sm font-semibold tracking-wider text-blue-warm-vivid-70'>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {!isLoading ? (
              rows && rows.length != 0 ? (
                rows.map((row, rowIndex) => (
                  <Fragment key={rowIndex}>
                    <tr
                      className={`border-b transition-colors duration-300 ${
                        selectedItems[rowIndex]
                          ? 'bg-blue-warm-vivid-50 hover:bg-blue-warm-vivid-60 '
                          : 'hover:bg-gray-10'
                      }`}
                    >
                      {collapsible &&
                      verificaCollapsible(
                        (row as Record<string, T>)[collapsible]
                      ) ? (
                        <th className='w-10 px-4'>
                          <Button
                            icon={
                              isOpenCollapsible[rowIndex]
                                ? faAngleUp
                                : faAngleDown
                            }
                            variant='tertiary'
                            dark={selectedItems[rowIndex]}
                            size='sm'
                            title='Expandir'
                            onClick={() => toggleCollapsible(rowIndex)}
                          />
                        </th>
                      ) : (
                        <th className='w-10 px-4'></th>
                      )}
                      {selectItems && (
                        <td className='w-10 px-4'>
                          <Checkbox
                            checked={selectedItems[rowIndex] || false}
                            onChange={(isChecked: boolean) =>
                              handleSelectItem(rowIndex, isChecked)
                            }
                            id={`item-${rowIndex}`}
                          />
                        </td>
                      )}
                      {columnTitles.map(column => (
                        <td
                          key={String(column.field)}
                          className={`px-6 py-4 whitespace-nowrap text-sm
                        ${
                          selectedItems[rowIndex]
                            ? 'text-white'
                            : 'text-gray-500'
                        } 
                  transition-all duration-600 ease-in-out max-w-72 text-wrap
                  ${
                    typeof String(row[column.field as keyof T]) ===
                      'string' &&
                    String(row[column.field as keyof T]).includes('@')
                      ? ''
                      : 'uppercase'
                  }`}
                        >
                          {column.render
                            ? column.render(
                                getNestedValue(
                                  row,
                                  column.field as string
                                ),
                                row
                              )
                            : String(
                                getNestedValue(row, column.field as string)
                              )}
                        </td>
                      ))}
                      {rowOptions && (
                        <td className='px-6 py-4 whitespace-nowrap text-webCenter text-sm font-medium'>
                          {rowOptions.length <= 2 ? (
                            <div className='flex gap-1'>
                              {rowOptions.map((option, index) => (
                                <Button
                                  key={index}
                                  icon={option?.icon}
                                  variant='tertiary'
                                  size='sm'
                                  dark={selectedItems[rowIndex]}
                                  title={option?.title || ''}
                                  isDelete={option.value === 'delete'}
                                  onClick={() =>
                                    option?.onClick && option.onClick(row)
                                  }
                                >
                                  {option?.label}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <DropdownOptions
                              icon={faEllipsis}
                              options={rowOptions}
                              onSelect={() => {}}
                            />
                          )}
                        </td>
                      )}
                    </tr>
                    {collapsible &&
                      isOpenCollapsible[rowIndex] &&
                      (row as Record<string, boolean>)[collapsible] && (
                        <tr className='border-b'>
                          <td colSpan={columnTitles.length + 3}>
                            <div className='p-4 text-gray-500 w-full'>
                              {collapsibleDiv
                                ? collapsibleDiv(row)
                                : (row as Record<string, boolean>)[
                                    collapsible
                                  ]}
                            </div>
                          </td>
                        </tr>
                      )}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columnTitles.length + 3}
                    className='text-center p-5'
                  >
                    Nenhum item encontrado
                  </td>
                </tr>
              )
            ) : (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <tr key={index} className=' h-16'>
                  <td className='px-6 py-4'></td>
                  {selectItems && (
                    <td className='w-10 px-4'>
                      <Skeleton
                        variant='rounded'
                        animation='wave'
                        width={24}
                        height={24}
                      />
                    </td>
                  )}
                  {columnTitles.map((_, colIndex) => (
                    <td key={colIndex} className='px-6 py-4'>
                      <Skeleton
                        variant='rounded'
                        animation='wave'
                        width={'70%'}
                        height={24}
                      />
                    </td>
                  ))}
                  {rowOptions && (
                    <td className='px-6 py-4'>
                      <Skeleton
                        variant='rounded'
                        animation='wave'
                        width={'70%'}
                        height={24}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {rows.length &&
      totalPages &&
      totalItems &&
      currentPage &&
      itemsPerPage ? (
        <Pagination
          totalPages={totalPages}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          filterClear={filterClear}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      ) : null}
    </div>
  )
}

export default Table