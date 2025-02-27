import { cloneDeep } from "lodash";
import imageFitSVG from "@plone/volto/icons/image-fit.svg";
import imageWideSVG from "@plone/volto/icons/image-wide.svg";
import imageFullSVG from "@plone/volto/icons/image-full.svg";
import imageNarrowSVG from "@eeacms/volto-ied-policy/../theme/assets/icons/image-narrow.svg";
import leftSVG from "@eeacms/volto-ied-policy/../theme/assets/icons/image-half-left.svg";
import rightSVG from "@eeacms/volto-ied-policy/../theme/assets/icons/image-half-right.svg";

export const ALIGN_INFO_MAP = {
  narrow_width: [imageNarrowSVG, "Narrow width"],
  container_width: [imageFitSVG, "Container width"],
  wide_width: [imageWideSVG, "Wide width"],
  full: [imageFullSVG, "Full width"],
  half_width_left: [leftSVG, "Half width left"],
  half_width_right: [rightSVG, "Half width right"],
};

export const addStylingFieldsetSchemaEnhancer = ({ schema }) => {
  const applied = schema?.properties?.styles;

  if (!applied) {
    const resSchema = cloneDeep(schema);

    resSchema.fieldsets.push({
      id: "styling",
      fields: ["styles"],
      title: "Styling",
    });
    resSchema.properties.styles = {
      widget: "object",
      title: "Styling",
      schema: {
        fieldsets: [
          {
            id: "default",
            title: "Default",
            fields: ["size"],
          },
        ],
        properties: {
          size: {
            widget: "style_align",
            title: "Section size",
            actions: Object.keys(ALIGN_INFO_MAP),
            actionsInfoMap: ALIGN_INFO_MAP,
          },
        },
        required: [],
      },
    };
    return resSchema;
  }

  return schema;
};
