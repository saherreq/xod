import React from 'react';
import { Icon } from 'react-fa';
import { PopupForm } from 'xod-client';
import { REDUCER_STATUS, PROJECT_STATUS } from '../constants';

const PopupProjectSelection = ({
  projects,
  isVisible,
  onSelect,
  onClose,
  onSwitchWorkspace,
  onCreateNewProject,
}) => {
  const onProjectSelect = meta => () => onSelect(meta);

  const renderProjectElement = (el) => {
    if (el.status === PROJECT_STATUS.ERROR) {
      return (
        <li className="error" key={el.path}>
          <div>
            <p className="path">
              <span>Path:</span>
              {el.path}
            </p>
            <p className="message">
              {el.message}
            </p>
          </div>
        </li>
      );
    }

    return (
      <li className="project" key={el.path}>
        <button onClick={onProjectSelect(el)}>
          <p className="name">{el.content.name} <span>by {el.content.authors}</span></p>
          <p className="path">
            <span>Path:</span>
            {el.path}
          </p>
        </button>
      </li>
    );
  };

  const renderContent = () => {
    if (projects.status === REDUCER_STATUS.LOADED) {
      return (
        <div>
          <div className="ModalContent">
            <ul className="ProjectList">
              {projects.list.map(renderProjectElement)}
            </ul>
          </div>
          <div className="ModalFooter">
            <button onClick={onSwitchWorkspace} className="Button">Switch workspace</button>
            <button onClick={onCreateNewProject} className="Button">Create new project</button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <Icon name="spinner" size="3x" spin />
        <p>Project list is loading. Please wait...</p>
      </div>
    );
  };

  return (
    <PopupForm
      title="Choose project to open:"
      className="PopupProjectSelection"
      onClose={onClose}
      isVisible={isVisible}
    >
      {renderContent()}
    </PopupForm>
  );
};

PopupProjectSelection.propTypes = {
  projects: React.PropTypes.object,
  isVisible: React.PropTypes.bool,
  onSelect: React.PropTypes.func,
  onClose: React.PropTypes.func,
  onSwitchWorkspace: React.PropTypes.func,
  onCreateNewProject: React.PropTypes.func,
};

PopupProjectSelection.defaultProps = {
  isVisible: false,
};

export default PopupProjectSelection;
