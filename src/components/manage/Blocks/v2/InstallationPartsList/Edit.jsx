import { withRouter } from 'react-router';

import { SidebarPortal } from '@plone/volto/components';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import View from './View';
import schema from './schema';

function Edit(props) {
  return (
    <>
      <View mode="edit" {...props} />
      <SidebarPortal selected={props.selected}>
        <BlockDataForm
          block={props.block}
          schema={schema}
          title={schema.title}
          onChangeBlock={props.onChangeBlock}
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
}

export default withRouter(Edit);
