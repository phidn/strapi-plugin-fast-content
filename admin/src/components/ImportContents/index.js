import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Box } from '@strapi/design-system/Box'
import { Typography } from '@strapi/design-system/Typography'
import { Select, Option } from '@strapi/design-system/Select';
import axiosInstance from './../../utils/axiosInstance'
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system/Table'
import { TableWrapper } from '../../styles/TableWrapper'
import FieldTypeIcon from '../FieldTypeIcon'
import getValueType from '../../utils/getValueType'
import { Dots, NextLink, PageLink, Pagination, PreviousLink } from '@strapi/design-system/Pagination';
import { useNotification } from '@strapi/helper-plugin'

const defaultStrapiFields = [
  'id',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
]

function ImportContents({ sampleData: importEntries, setLoadingImport }, importRef) {
  const toggleNotification = useNotification()
  const importEntry = importEntries[0] || {}

  const [contentTypes, setContentTypes] = useState([])
  const [selected, setSelected] = useState({})
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [mappedFields, setMappedFields] = useState([])
  const PAGINATION_SIZE = 5
  const [pagination, setPagination] = useState({ active: 1, count: 0, rows: [] })

  useImperativeHandle(importRef, () => ({
    submit() {
      _import()
    }
  }))

  useEffect(() => {
    getContentTypes()
  }, [])

  useEffect(() => {
    if (!selected.attributes) return
    const obj = {}
    Object
      .keys(selected.attributes)
      .filter(x => defaultStrapiFields.indexOf(x) === -1)
      .forEach(x => obj[x] = selected.attributes[x])
    setSelectedAttributes(obj)
  }, [selected])

  useEffect(() => {
    if (!!!importEntries[0] || !selected.attributes) return

    const entry = importEntries[0]
    const entryKeys = Object.keys(entry)
    const _mapped = []
    Object.entries(selected.attributes).map(([key, value], index) => {
      if (entryKeys.indexOf(key) !== -1) {
        _mapped.push({
          name: key,
          target: entryKeys[entryKeys.indexOf(key)],
          type: value.type
        })
      }
    })
    setMappedFields(_mapped)
  }, [importEntries, selected])

  useEffect(() => {
    getPagination(1)
  }, [importEntries])

  const getContentTypes = async () => {
    const { data } = await axiosInstance.get('/fast-content/content-types')
    if (data.data[0]?.info?.singularName) {
      setContentTypes(data.data)
      setSelected(data.data[0])
    }
  }

  const changeSelectCollection = (value) => {
    const index = contentTypes.findIndex(x => x.info.singularName === value)
    if (index !== -1) {
      setSelected(contentTypes[index])
    }
  }

  const changeTargetField = (key, value, _value) => {
    const mappedItem = {
      name: key,
      target: _value,
      type: value.type
    }
    const _mapped = [...mappedFields]
    const index = _mapped.findIndex(x => x.name === key)
    if (index === -1) {
      setMappedFields([...mappedFields, mappedItem])
    } else {
      _mapped[index] = mappedItem
      setMappedFields(_mapped)
    }
  }

  const getPagination = (page) => {
    const count = Math.ceil(importEntries.length / PAGINATION_SIZE)
    let rows = []
    if (page === 1) {
      rows = importEntries.slice(0, PAGINATION_SIZE)
    }
    if (page > 1) {
      const from = (page - 1) * PAGINATION_SIZE
      const to = page * PAGINATION_SIZE
      rows = importEntries.slice(from, to)
    }
    setPagination({
      active: page,
      rows,
      count
    })
  }

  const changePagination = (e, page) => {
    e.preventDefault()
    getPagination(page)
  }

  const _import = async () => {
    setLoadingImport(true)
    const _importEntries = importEntries.map(x => {
      const entry = {}
      mappedFields.forEach(({ name, target }) => entry[name] = x[target])
      return entry
    })

    try {
      const { data } = await axiosInstance.post('/fast-content/import-entries', {
        entries: _importEntries,
        uid: selected.uid
      })
      toggleNotification({ type: 'success', message: 'Successfully import' })
    } catch (error) {
      toggleNotification({ type: 'warning', message: 'An error occurred while importing contents' })
    }

    setLoadingImport(false)
  }


  return (
    <Box color="neutral800" padding={4} background="neutral0">
      <Box paddingTop={2} paddingLeft={4}>
        <Select
          id="select-your-collection"
          label="CHOOSE YOUR COLLECTION"
          required
          value={selected?.info?.singularName}
          onChange={changeSelectCollection}
        >
          {contentTypes.map(x => (
            <Option key={x.info.singularName} value={x.info.singularName}>
              {x.info.displayName}
            </Option>
          ))}
        </Select>
      </Box>

      <Box paddingTop={2} paddingLeft={4}>
        {!!importEntries.length && !!selectedAttributes && (
          <>
            <TableWrapper>
              <Table colCount={Object.keys(selectedAttributes).length} rowCount={importEntries.length + 10}>

                <Thead>
                  <Tr>
                    {Object
                      .entries(selectedAttributes)
                      .filter(x => defaultStrapiFields.indexOf(x[0]) === -1)
                      .map(([key, value], index) => (
                        <Th key={`Thead-Tr-${index}`}>
                          <FieldTypeIcon type={value.type} />
                          <Box paddingLeft={2}>
                            <Typography variant="sigma">{key}</Typography>
                          </Box>
                        </Th>
                      ))
                    }
                  </Tr>
                </Thead>

                <Tbody>

                  {/* Field type */}
                  <Tr>
                    {Object
                      .entries(selectedAttributes)
                      .map(([key, value], index) => {
                        const _index = mappedFields.findIndex(x => x.name === key)
                        const _value = _index !== -1 ? mappedFields[_index].target : ''

                        return (
                          <Td key={`Tbody-Tr-Td-fieldName-${index}`} className='tr-td-select'>
                            <Select
                              startIcon={_value? <FieldTypeIcon type={getValueType(importEntry[_value])} />: <></>}
                              value={_value}
                              onChange={_value => changeTargetField(key, value, _value)}
                            >
                              {Object.entries(importEntry).map(([entryKey, entryValue], entryIndex) => (
                                <Option
                                  value={entryKey}
                                  startIcon={<FieldTypeIcon type={getValueType(entryValue)} />}
                                  key={`option-${entryKey}-${entryIndex}`}
                                >
                                  {entryKey}
                                </Option>
                              ))}
                            </Select>
                          </Td>
                        )
                      })}
                  </Tr>

                  {pagination.rows.map((entry, entryIndex) => {
                    return (
                      <Tr key={`Tbody-Tr-${entryIndex}`}>
                        {Object.entries(selectedAttributes).map(([key, value], index) => {
                          const _index = mappedFields.findIndex(x => x.name === key)
                          let _value = ''
                          if (_index !== -1) {
                            const _fieldKey = mappedFields[_index].target
                            _value = _.isString(entry[_fieldKey])
                              ? entry[_fieldKey]
                              : JSON.stringify(entry[_fieldKey])
                          }
                          return (
                            <Td key={`Tbody-Tr-Td-${index}`}>
                              <Typography textColor="neutral800">{_value}</Typography>
                            </Td>
                          )
                        })}
                      </Tr>
                    )
                  })}

                </Tbody>
              </Table>
            </TableWrapper>
            <Box paddingTop={4}>
              <Pagination activePage={pagination.active} pageCount={pagination.count}>
                <PreviousLink to="/1"
                  onClick={e => changePagination(e, pagination.active - 1)}
                >
                  Previous
                </PreviousLink>
                <PageLink to="/2"
                  number={`${pagination.active} / ${pagination.count}`}
                  onClick={e => e.preventDefault()}
                >
                  {pagination.active}
                </PageLink>
                <NextLink to="/2"
                  onClick={e => changePagination(e, pagination.active + 1)}
                >
                  Next page
                </NextLink>
              </Pagination>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default forwardRef(ImportContents)
