import React from 'react';
import { connect } from 'react-redux';
import { isArray } from 'lodash';
import config from '@plone/volto/registry';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import SlateEditor from '@plone/volto-slate/editor/SlateEditor';
import {
  uploadContent,
  saveSlateBlockSelection,
} from '@plone/volto-slate/actions';
import { handleKeyDetached } from '@plone/volto-slate/blocks/Text/keyboard';
import Item from './Item';
import getSchema from './schema';
import { useIntl } from 'react-intl';

export const createSlateParagraph = (text) => {
  return isArray(text)
    ? text
    : [
        {
          type: config.settings.slate.defaultBlockType,
          children: [{ text: 'Choose media & type...' }],
        },
      ];
};

const Edit = (props) => {
  const intl = useIntl();
  const { slate } = config.settings;
  const {
    data = {},
    block = null,
    selected = false,
    index,
    properties,
    onChangeBlock,
    onSelectBlock,
  } = props;
  const { description } = data;
  const schema = React.useMemo(() => getSchema(props, intl), [props, intl]);
  const extensions = React.useMemo(() => {
    return slate.textblockExtensions.filter(
      (f) => f.name !== 'withSplitBlocksOnBreak',
    );
  }, [slate.textblockExtensions]);
  const withBlockProperties = React.useCallback(
    (editor) => {
      editor.getBlockProps = () => props;
      return editor;
    },
    [props],
  );

  const handleFocus = React.useCallback(() => {
    if (!selected) {
      onSelectBlock(block);
    }
  }, [onSelectBlock, selected, block]);

  return (
    <>
      <Item {...data} mode="edit">
        <SlateEditor
          key={true}
          detached={!true}
          onKeyDown={handleKeyDetached}
          index={index}
          properties={properties}
          extensions={[...extensions]}
          renderExtensions={[withBlockProperties]}
          value={createSlateParagraph(description)}
          onChange={(description) => {
            onChangeBlock(block, {
              ...data,
              description,
            });
          }}
          block={block}
          onFocus={handleFocus}
          selected={selected}
          slateSettings={slate}
        />
      </Item>
      <SidebarPortal selected={selected}>
        <BlockDataForm
          block={block}
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
    </>
  );
};

export default connect(
  (state, props) => {
    const blockId = props.block;
    return {
      defaultSelection: blockId
        ? state.slate_block_selections?.[blockId]
        : null,
      uploadRequest: state.upload_content?.[props.block]?.upload || {},
      uploadedContent: state.upload_content?.[props.block]?.data || {},
    };
  },
  {
    uploadContent,
    saveSlateBlockSelection, // needed as editor blockProps
  },
)(Edit);
