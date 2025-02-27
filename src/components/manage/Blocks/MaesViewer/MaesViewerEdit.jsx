import { useMemo } from 'react';
import { compose } from 'redux';
import cx from 'classnames';
import { SidebarPortal } from '@plone/volto/components'; // EditBlock
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';

import maesViewrSchema from './schema';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import MaesViewerView from './MaesViewerView';
import { defaultHoverTemplate } from './constants';

function Edit(props) {
  const { data, provider_data, block, selected, onChangeBlock } = props;

  const schema = useMemo(() => {
    if (!provider_data) return maesViewrSchema;

    const select_field = 'Ecosystem_level2';
    const choices = Array.from(
      new Set(provider_data?.[select_field] || []),
    ).map((n) => [n, n]);

    const newSchema = { ...maesViewrSchema };
    newSchema.properties.ecosystem.choices = choices;

    if (data && !data.hoverTemplate) {
      onChangeBlock(block, {
        ...data,
        hoverTemplate: defaultHoverTemplate,
      });
    }

    return newSchema;
  }, [block, data, onChangeBlock, provider_data]);

  return (
    <div className={cx('block', { selected })}>
      <MaesViewerView data={data} />

      <SidebarPortal selected={selected}>
        <InlineForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </div>
  );
}

export default compose(
  connectToProviderData((props) => ({
    provider_url: props.data?.provider_url,
  })),
)(Edit);
