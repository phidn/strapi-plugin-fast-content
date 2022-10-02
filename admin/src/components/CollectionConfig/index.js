import React from 'react'
import { GridLayout } from '@strapi/design-system/Layout';
import { TextInput } from '@strapi/design-system/TextInput';

function CollectionConfig({
  changeContentTypeConfig,
  displayName,
  singularName,
  pluralName,
  disabled = [false, true, true]
}) {
  return (
    <GridLayout>
      <TextInput
        label="Display name"
        name="content"
        onChange={changeContentTypeConfig}
        value={displayName}
        disabled={disabled[0]}
      />
      <TextInput
        label="API ID (Singular)"
        name="content"
        hint="The UID is used to generate the API routes and databases tables/collections"
        onChange={() => { }}
        value={singularName}
        disabled={disabled[1]}
      />
      <TextInput
        label="API ID (Plural)"
        name="content"
        onChange={() => { }}
        value={pluralName}
        disabled={disabled[2]}
      />
    </GridLayout>
  )
}

export default CollectionConfig