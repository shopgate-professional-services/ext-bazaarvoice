import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import { themeConfig } from '@shopgate/engage';
import { I18n } from '@shopgate/engage/components';

const { colors } = themeConfig;
const styles = {
  container: css({
    marginLeft: 20,
  }),
  wrapper: css({
    marginTop: 20,
  }),
  text: css({
    fontSize: 14,
    fontStyle: 'italic',
    whiteSpace: 'pre-line',
  }),
  info: css({
    color: colors.shade3,
    fontSize: 14,
  }),
};

/**
 * @param {Object} props Props
 * @return {JSX}
 */
const ReviewComment = ({ review }) => {
  const { clientResponses = [] } = review.additionalData || {};

  if (!clientResponses.length) {
    return null;
  }

  return (
    <div className={styles.container}>
      {clientResponses.map((clientResponse, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={styles.wrapper} key={clientResponse.Date + i}>
          <div className={styles.text}>{`"${clientResponse.Response}"`}</div>
          <div className={styles.info}>
            <I18n.Date timestamp={new Date(clientResponse.Date).getTime()} format="long" />
            {' '}
            <I18n.Text string="reviews.author" params={{ author: clientResponse.Name }} />
          </div>
        </div>
      ))}
    </div>
  );
};

ReviewComment.propTypes = {
  review: PropTypes.shape().isRequired,
};

export default ReviewComment;
