import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Box } from '@strapi/design-system/Box'
import { Typography } from '@strapi/design-system/Typography'
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system/Table'
import _ from 'lodash'
import { TableWrapper } from '../../styles/TableWrapper'
import FieldTypeIcon from '../FieldTypeIcon'
import { TextInput } from '@strapi/design-system/TextInput'
import pluralize from 'pluralize'
import slugify from '@sindresorhus/slugify'
import axiosInstance from '../../utils/axiosInstance'
import { Select, Option } from '@strapi/design-system/Select'
import { Flex } from '@strapi/design-system/Flex'
import { IconButton } from '@strapi/design-system/IconButton'
import ArrowLeft from '@strapi/icons/ArrowLeft'
import ArrowRight from '@strapi/icons/ArrowRight'
import Trash from '@strapi/icons/Trash'
import { Divider } from '@strapi/design-system/Divider'
import { useNotification, useAutoReloadOverlayBlocker } from '@strapi/helper-plugin'
import CollectionConfig from '../CollectionConfig'
import getValueType from '../../utils/getValueType'
import { NextLink, PageLink, Pagination, PreviousLink } from '@strapi/design-system/Pagination';
import serverRestartWatcher from '../../utils/serverRestartWatcher'
import { toFriendly } from '../../utils/toFriendly'

const defaultStrapiFields = [
  'id',
  'created_at',
  'updated_at',
  'published_at',
  'created_by',
  'updated_by',
]
const PAGINATION_SIZE = 5

function GenerateContentType({ sampleData, setLoadingGenerate }, generateRef) {
  const toggleNotification = useNotification()
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker()

  const [mappedFields, setMappedFields] = useState([])
  const [contentType, setContentType] = useState({
    "draftAndPublish": false,
    "pluginOptions": {},
    "singularName": "sample",
    "pluralName": "samples",
    "displayName": "Sample",
    "kind": "collectionType",
    "attributes": {}
  })
  const [pagination, setPagination] = useState({ active: 1, count: 0, rows: [] })

  // console.log({
  //   mappedFields,
  //   contentType
  // })

  useImperativeHandle(generateRef, () => ({
    submit() {
      generate()
    }
  }))
  
  useEffect(() => {
    analyze()
    getPagination(1)
  }, [])

  useEffect(() => {
    analyze()
    setContentType({
      ...contentType,

    })
  }, [contentType.singularName])
  

  const analyze = () => {
    const _mappedFields = []
    const firstEntry = sampleData[0]
    const keys = Object.keys(firstEntry || {})

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = firstEntry[key]
      let _type = getValueType(value)
      let label = toFriendly(key)

      if (defaultStrapiFields.indexOf(label) !== -1) {
        label = `${toFriendly(contentType.singularName, '')}_${label}`
      }
      _mappedFields.push({
        name: key,
        target: label,
        type: _type
      })
    }

    setMappedFields(_mappedFields)
  }

  const getPagination = (page) => {
    const count = Math.ceil(sampleData.length / PAGINATION_SIZE)
    let rows = []
    if(page === 1) {
      rows = sampleData.slice(0, PAGINATION_SIZE)
    }
    if(page > 1) {
      const from = (page - 1) * PAGINATION_SIZE
      const to = page * PAGINATION_SIZE
      rows = sampleData.slice(from, to)
    }
    setPagination({ active: page, rows, count })
  }

  const changeContentTypeConfig = (e) => {
    const value = e.target.value
    const slug = slugify(value, { separator: '' })
    const plural = pluralize(slug, 2)

    setContentType({
      ...contentType,
      singularName: slug,
      pluralName: plural,
      displayName: value,
    })
  }

  const changeField = (index, key, value) => {
    const _mappedFields = [...mappedFields]
    _mappedFields[index][key] = value
    setMappedFields(_mappedFields)
  }

  const removeField = (index) => {
    const _mappedFields = [...mappedFields].filter((x, _index) => _index !== index)
    setMappedFields(_mappedFields)
  }

  const moveItem = (data, from, to) => {
    const _data = JSON.parse(JSON.stringify(data))
    var f = _data.splice(from, 1)[0]
    _data.splice(to, 0, f)
    return _data
  }

  const moveField = (from, to) => {
    const _mappedFields = moveItem([...mappedFields], from, to)
    setMappedFields(_mappedFields)
  }

  const changePagination = (e, page) => {
    e.preventDefault()
    getPagination(page)
  }

  const generate = async () => {
    const attributes = {}
    mappedFields.forEach(x => attributes[x.target] = { type: x.type })
    const _contentType = { ...contentType, attributes }
    const body = {
      components: [],
      contentType: _contentType
    }

    lockAppWithAutoreload()

    let _toggleNotification
    try {
      const { data } = await axiosInstance.post('/content-type-builder/content-types', body)
      await serverRestartWatcher(true)
      _toggleNotification = { type: 'success', message: 'Successfully generate' }
    } catch (error) {
      _toggleNotification = { type: 'warning', message: 'An error occurred while generating Content-Type' }
    }

    await unlockAppWithAutoreload()
    toggleNotification(_toggleNotification)
    setLoadingGenerate(false)
  }

  return (
    <Box color="neutral800" padding={4} background="neutral0">
      <Box paddingTop={2} paddingLeft={4} paddingBottom={4}>
        <Box paddingTop={2} paddingBottom={2}>
          <Typography variant="delta">Collection configurations</Typography>
        </Box>
        <CollectionConfig
          changeContentTypeConfig={changeContentTypeConfig}
          displayName={contentType.displayName}
          singularName={contentType.singularName}
          pluralName={contentType.pluralName}
          disabled={[false, true, true]}
        />
      </Box>

      {!!sampleData?.length && (
        <Box paddingTop={2} paddingLeft={4} paddingBottom={2}>

          {/* Collection configurations */}
          <TableWrapper>
            <Table colCount={mappedFields.length} rowCount={sampleData.length + 10}>
              <Tbody>

                {/* Field target name */}
                <Tr>
                  <Th className='Th-field-name'>
                    <Typography variant="sigma">Name</Typography>
                  </Th>
                  {mappedFields.map((field, index) => (
                    <Td key={`Tbody-Tr-Td-fieldName-${index}`} className='td-field-name'>
                      <TextInput
                        type="text"
                        aria-label="Field name"
                        name="fieldName"
                        onChange={() => { }}
                        value={field.name}
                        disabled={true}
                      />
                    </Td>
                  ))}
                </Tr>

                {/* Field target name */}
                <Tr>
                  <Th className='Th-field-name'>
                    <Typography variant="sigma">Friendly name</Typography>
                  </Th>
                  {mappedFields.map((field, index) => (
                    <Td key={`Tbody-Tr-Td-fieldTargetName-${index}`} className='td-field-name'>
                      <TextInput
                        type="text"
                        aria-label="Field target name"
                        name="fieldTargetName"
                        onChange={e => changeField(index, 'target', e.target.value)}
                        value={field.target}
                      />
                    </Td>
                  ))}
                </Tr>

                {/* Field type */}
                <Tr>
                  <Th className='Th-field-name'>
                    <Typography variant="sigma">Type</Typography>
                  </Th>
                  {mappedFields.map((field, index) => (
                    <Td key={`Tbody-Tr-Td-field-${index}`} className='tr-td-select'>
                      <Select
                        startIcon={<FieldTypeIcon type={field.type} />}
                        value={field.type}
                        onChange={value => changeField(index, 'type', value)}
                      >
                        <Option value={'string'} startIcon={<FieldTypeIcon type='text' />}>Short Text</Option>
                        <Option value={'text'} startIcon={<FieldTypeIcon type='text' />}>Long Text</Option>
                        <Option value={'email'} startIcon={<FieldTypeIcon type='email' />}>Email</Option>
                        <Option value={'richtext'} startIcon={<FieldTypeIcon type='richtext' />}>Rich text</Option>
                        <Option value={'password'} startIcon={<FieldTypeIcon type='password' />}>Password</Option>
                        <Option value={'integer'} startIcon={<FieldTypeIcon type='integer' />}>Integer (ex: 10)</Option>
                        <Option value={'biginteger'} startIcon={<FieldTypeIcon type='biginteger' />}>Big integer (ex: 123456789)</Option>
                        <Option value={'decimal'} startIcon={<FieldTypeIcon type='decimal' />}>Decimal (ex: 2.22)</Option>
                        <Option value={'float'} startIcon={<FieldTypeIcon type='float' />}>Float (ex: 3.333333333)</Option>
                        <Option value={'date'} startIcon={<FieldTypeIcon type='date' />}>Date (ex: 01/01/2022)</Option>
                        <Option value={'datetime'} startIcon={<FieldTypeIcon type='datetime' />}>Datetime (ex: 01/01/2022 00:00 AM)</Option>
                        <Option value={'time'} startIcon={<FieldTypeIcon type='time' />}>Time (ex: 00:00 AM)</Option>
                        <Option value={'single_media'} startIcon={<FieldTypeIcon type='single_media' />}>Single media</Option>
                        <Option value={'multiple_media'} startIcon={<FieldTypeIcon type='multiple_media' />}>Multiple media</Option>
                        <Option value={'boolean'} startIcon={<FieldTypeIcon type='boolean' />}>Boolean</Option>
                        <Option value={'json'} startIcon={<FieldTypeIcon type='json' />}>JSON</Option>
                      </Select>
                    </Td>
                  ))}
                </Tr>

                {/* Actions */}
                <Tr>
                  <Th className='Th-field-name'>
                    <Typography variant="sigma">Actions</Typography>
                  </Th>
                  {mappedFields.map((field, index) => (
                    <Td key={`Tbody-Tr-Td-${index}`} className='tr-td-actions'>
                      <Flex>
                        <IconButton
                          onClick={() => moveField(index, index - 1)}
                          label="Move left"
                          icon={<ArrowLeft />}
                        />
                        <IconButton
                          onClick={() => removeField(index)}
                          label="Remove"
                          icon={<Trash />}
                        />
                        <IconButton
                          onClick={() => moveField(index, index + 1)}
                          label="Move right"
                          icon={<ArrowRight />}
                        />
                      </Flex>
                    </Td>
                  ))}
                </Tr>

              </Tbody>
            </Table>
          </TableWrapper>
          <Box paddingTop={6} paddingBottom={6}>
            <Divider />
          </Box>
          <Box paddingTop={2} paddingBottom={2}>
            <Typography variant="delta">{sampleData.length} entries</Typography>
          </Box>

          {/* List entries */}
          <TableWrapper>
            <Table colCount={mappedFields.length} rowCount={sampleData.length}>
              <Thead>
                <Tr>
                  {mappedFields.map((field, index) => (
                    <Th key={`Tbody-Tr-Th-fieldName-${index}`} className='Th-field-name'>
                      <Typography variant="sigma">
                        {field.target}
                      </Typography>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {pagination.rows.map((entry, entryIndex) => {
                  return (
                    <Tr key={`Tbody-Tr-${entryIndex}`}>
                      {mappedFields.map(({ name }, index) => (
                        <Td key={`Tbody-Tr-Td-${index}`}>
                          <Typography textColor="neutral800">
                            {_.isString(entry[name]) ? entry[name] : JSON.stringify(entry[name])}
                          </Typography>
                        </Td>
                      ))}
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableWrapper>
          <Box paddingTop={4}>
            <Pagination activePage={pagination.active} pageCount={pagination.count}>
              <PreviousLink 
                to="/1"
                onClick={e => changePagination(e, pagination.active - 1)}
              >
                Previous
              </PreviousLink>
              <PageLink 
                to="/2" 
                number={`${pagination.active} / ${pagination.count}`}
                onClick={e => e.preventDefault()}
              >
                {pagination.active}
              </PageLink>
              <NextLink 
                to="/2"
                onClick={e => changePagination(e, pagination.active + 1)}
              >
                Next page
              </NextLink>
            </Pagination>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default forwardRef(GenerateContentType)
