import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RedirectView = (props) => {
  const { content } = props;
  const history = useHistory();
  const isLoggedIn = useSelector((state) => !!state.userSession?.token);

  useEffect(() => {
    if (
      __CLIENT__ &&
      !isLoggedIn &&
      content?.link &&
      typeof content.link === 'string'
    ) {
      try {
        const url = new URL(content.link, window.location.origin);
        const relativePath = url.pathname + url.search + url.hash;

        history.push(relativePath);
      } catch (error) {
        console.error('Invalid URL in content.link:', content.link);
      }
    }
  }, [content, history, isLoggedIn]);

  if (isLoggedIn) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p>This is a redirect page that will redirect when unlogged in to:</p>
        <code>{content?.link}</code>
      </div>
    );
  }

  return null;
};

export default RedirectView;
