import React from "react";
import SidebarPortal from "@plone/volto/components/manage/Sidebar/SidebarPortal";
import InlineForm from "@plone/volto/components/manage/Form/InlineForm";
import { getFieldURL } from "@eeacms/volto-ied-policy/helpers";
import schema from "./schema";

const Edit = (props) => {
  return (
    <>
      {props.data.url && <p>Redirect to {getFieldURL(props.data.url)}</p>}
      {!props.data.url && <p>Select redirect target</p>}

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
