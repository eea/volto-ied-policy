import { useEffect } from "react";
import { getFieldURL } from "@eeacms/volto-ied-policy/helpers";

const View = (props) => {
  useEffect(() => {
    props.history.push(getFieldURL(props.data.url));
    /* eslint-disable-next-line */
  }, []);

  return null;
};

export default View;
