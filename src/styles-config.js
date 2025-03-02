import { Icon } from "@plone/volto/components";
import contentBoxSVG from "@eeacms/volto-ied-policy/icons/content-box.svg";

const config = (config) => {
  config.settings.available_colors = [
    "#005248", // primary color
    "#00A390", // secondary color
    "#3D5265", // tertiary color
    "#FAC50D", // brand color
    "#B83230", // error state
    "#FF9933", // warning state
    "#007B6C", // success state
    "#004B7F", // info state
    "#005248", // green shade
    "#007B6C", // green shade
    "#00A390", // green shade
    "#00CCB4", // green shade
    "#00F5D8", // green shade
    "#85FFF1", // green shade
    "#C8FFF8", // green shade
    "#FFFFFF", // white
    "#2E3E4C", // blue grey
    "#3D5265", // blue grey
    "#4C677F", // blue grey
    "#6989A5", // blue grey
    "#8EA6C2", // blue grey
    "#ACCAE5", // blue grey
    "#DAE8F4", // blue grey
    "#FFFFFF", // white
    "#C35527", // yellow shade
    "#FF9933", // yellow shade
    "#FDAF20", // yellow shade
    "#FAC50D", // yellow shade
    "#FAD936", // yellow shade
    "#FBEC9B", // yellow shade
    "#FEF6CD", // yellow shade
    "#FFFFFF", // white
    "#5C1918", // red shade
    "#B83230", // red shade
    "#C65B59", // red shade
    "#D78890", // red shade
    "#E7B2C0", // red shade
    "#F6DDF0", // red shade
    "#FBEEF8", // red shade
    "#FFFFFF", // white
    "#003052", // blue shade
    "#004B7F", // blue shade
    "#006BB8", // blue shade
    "#0083E0", // blue shade
    "#0A99FF", // blue shade
    "#47B3FF", // blue shade
    "#A0D7FF", // blue shade
    "#FFFFFF", // white
    "#000000", // grey shade
    "#323232", // grey shade
    "#747678", // grey shade
    "#BCBEC0", // grey shade
    "#E6E7E8", // grey shade
    "#F9F9F9", // grey shade
    "#FFFFFF", // white
  ];

  config.blocks.blocksConfig.columnsBlock =
    config.blocks.blocksConfig.columnsBlock || {};
  config.blocks.blocksConfig.columnsBlock.available_colors = [
    ...config.settings.available_colors,
  ];

  config.settings.slate = config.settings.slate || {};
  config.settings.slate.styleMenu = config.settings.slate.styleMenu || {};
  config.settings.slate.styleMenu.inlineStyles = [
    ...(config.settings.slate.styleMenu?.inlineStyles || []),
    { cssClass: "primary-big-text", label: "Big text" },
    { cssClass: "medium-text", label: "Medium text" },
    { cssClass: "small-text", label: "Small text" },
    { cssClass: "white-text", label: "White text" },
    { cssClass: "primary-text", label: "Primary text" },
    { cssClass: "secondary-text", label: "Secondary text" },
    { cssClass: "tertiary-text", label: "Tertiary text" },
    { cssClass: "dark-green-text", label: "Dark green text" },
    { cssClass: "blue-text", label: "Blue text" },
    { cssClass: "red-text", label: "Red text" },
    { cssClass: "yellow-text", label: "Yellow text" },
    { cssClass: "grey-text", label: "Grey text" },
  ];

  config.settings.pluggableStyles = [
    ...(config.settings.pluggableStyles || []),
    {
      id: "content-box-light-green",
      title: "Light green",
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="light-green" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box light-green">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: "borderBlock",
      title: "Border",
      cssClass: "border-block",
    },
    {
      id: "horizontalLine",
      title: "Horizontal line",
      cssClass: "horizontal-line",
    },
    {
      id: "dividedBlock",
      title: "Divided",
      cssClass: "divided-block",
    },
    {
      id: "shadedBlock",
      title: "Shaded & Divided",
      cssClass: "shaded-block",
    },
    {
      id: "padded",
      title: "Padded",
      cssClass: "padded",
    },
    {
      id: "marginless",
      title: "Marginless",
      cssClass: "marginless",
    },
    {
      id: "roundedBlock",
      title: "Rounded image",
      cssClass: "rounded-block",
    },
    {
      id: "mobileReversed",
      title: "Mobile reversed",
      cssClass: "mobile-reversed",
    },
    {
      id: "relevantLink",
      title: "Relevant link",
      cssClass: "relevant-link",
    },
    {
      id: "n2kList",
      title: "N2k list",
      cssClass: "n2k-list",
    },
    {
      id: "n2kGreenBorder",
      title: "N2k green border",
      cssClass: "n2k-green-border",
    },
    {
      id: "n2kCircle",
      title: "N2k circle",
      cssClass: "n2k-circle",
    },
  ];

  // Plotly bise color
  config.settings.plotlyCustomColors = [
    {
      title: "A2",
      colorscale: [
        "#3D2201",
        "#603808",
        "#8B5E34",
        "#BC8A5F",
        "#E7BC91",
        "#FFEDD8",
        "#FFF6EC",
      ],
    },
    {
      title: "A1",
      colorscale: ["#12957D", "#F9EA8A", "#DD552B", "#AEB0B3"],
    },
  ];

  return config;
};

export default config;
