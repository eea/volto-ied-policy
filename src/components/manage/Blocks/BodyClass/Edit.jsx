import React from 'react';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import schema from './schema';

const Edit = (props) => {
  return (
    <>
      <p>Body className: {props.data.class}</p>
      <BodyClass className={props.data.class || ''} />

      <SidebarPortal selected={props.selected}>
        <InlineForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            props.onChangeBlock(props.block, {
              ...props.data,
              [id]: value,
            });
          }}
          formData={props.data}
        />
      </SidebarPortal>
    </>
  );
};

export default Edit;
