import React from 'react';
import classNames from 'classnames';
import { SkyLightStateless } from 'react-skylight';
import EventListener from 'react-event-listener';

import { noop } from '../../utils/ramda';
import { KEYCODE } from '../../utils/constants';

const PopupAlert = ({ title, children, closeText, className, onClose, isModal, isVisible }) => {
  const wrapperClassNames = classNames('PopupAlert', className);
  const onCloseClicked = (!isModal) ? onClose : noop;

  const onKeyDown = (event) => {
    const keycode = event.keycode || event.which;
    if (keycode === KEYCODE.ESCAPE) {
      onCloseClicked();
    }
  };

  return (
    <div className={wrapperClassNames}>
      <EventListener target={document} onKeyDown={onKeyDown} />
      <SkyLightStateless
        isVisible={isVisible}
        title={title}
        isClosable={!isModal}
        onCloseClicked={onCloseClicked}
        onOverlayClicked={onCloseClicked}
      >
        <div className="ModalBody">
          <div className="ModalContent">
            {children}
          </div>
          <div className="ModalFooter">
            <button
              className="Button"
              onClick={onClose}
              autoFocus
            >
              {closeText}
            </button>
          </div>
        </div>
      </SkyLightStateless>
    </div>
  );
};

PopupAlert.propTypes = {
  title: React.PropTypes.string,
  children: React.PropTypes.any,
  closeText: React.PropTypes.string,
  className: React.PropTypes.string,
  onClose: React.PropTypes.func,
  isModal: React.PropTypes.bool,
  isVisible: React.PropTypes.bool,
};
PopupAlert.defaultProps = {
  title: 'Alert!',
  closeText: 'Okay',
  className: '',
  onClose: noop,
  isModal: false,
  isVisible: true,
};

export default PopupAlert;
