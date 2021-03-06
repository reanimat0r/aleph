import React, { Component } from 'react';
import {
  Classes, Dialog,
} from '@blueprintjs/core';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { ingestDocument as ingestDocumentAction } from 'src/actions';
import { showErrorToast, showSuccessToast } from 'src/app/toast';
import convertPathsToTree from 'src/util/convertPathsToTree';
import DocumentUploadForm from './DocumentUploadForm';
import DocumentUploadStatus from './DocumentUploadStatus';
import DocumentUploadView from './DocumentUploadView';


import './DocumentUploadDialog.scss';


const messages = defineMessages({
  title: {
    id: 'document.upload.title',
    defaultMessage: 'Upload Documents',
  },
  success: {
    id: 'document.upload.success',
    defaultMessage: 'Documents are being processed...',
  },
  error: {
    id: 'document.upload.error',
    defaultMessage: 'There was an error while uploading the file.',
  },
});


export class DocumentUploadDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: props.filesToUpload || [],
      uploadCount: 0,
      currUploading: null,
    };

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onFilesChange = this.onFilesChange.bind(this);
    this.incrementProgress = this.incrementProgress.bind(this);
  }

  onFilesChange(files) {
    this.setState({ files });
  }

  async onFormSubmit(files) {
    const {
      intl, onUploadSuccess, parent,
    } = this.props;

    const fileTree = convertPathsToTree(files);

    try {
      await this.traverseFileTree(fileTree, parent);
      showSuccessToast(intl.formatMessage(messages.success));
      if (onUploadSuccess) onUploadSuccess();
    } catch (e) {
      showErrorToast(intl.formatMessage(messages.error));
    }
  }

  incrementProgress(file) {
    this.setState(({ uploadCount }) => ({
      currUploading: file,
      uploadCount: uploadCount + 1,
    }));
  }

  async traverseFileTree(tree, parent) {
    const filePromises = Object.entries(tree)
      .map(([key, value]) => {
        // base case
        if (value instanceof File) {
          return this.uploadFile(value, parent);
        }
        // recursive case
        return new Promise((resolve, reject) => {
          this.uploadFolder(key, parent)
            .then(async ({ id }) => {
              if (id) {
                await this.traverseFileTree(value, { id, foreign_id: key });
                resolve();
                return;
              }
              reject();
            });
        });
      });

    await Promise.all(filePromises);
  }

  uploadFile(file, parent) {
    const { collection, ingestDocument } = this.props;
    this.incrementProgress(file.name);

    const metadata = {
      file_name: file.name,
      mime_type: file.type,
    };
    if (parent?.id) {
      metadata.parent_id = parent.id;
    }
    return ingestDocument(collection.id, metadata, file);
  }

  uploadFolder(title, parent) {
    const { collection, ingestDocument } = this.props;

    const metadata = {
      file_name: title,
      foreign_id: title,
    };
    if (parent?.id) {
      metadata.foreign_id = `${parent.id}/${title}`;
      metadata.parent_id = parent.id;
    }

    return ingestDocument(collection.id, metadata, null);
  }


  renderContent() {
    const { files, uploadCount, currUploading } = this.state;

    if (currUploading) {
      return (
        <DocumentUploadStatus
          percentCompleted={uploadCount / files.length}
          uploading={currUploading}
        />
      );
    }
    if (files && files.length) {
      return <DocumentUploadView files={files} onSubmit={this.onFormSubmit} />;
    }

    return <DocumentUploadForm onFilesChange={this.onFilesChange} />;
  }

  render() {
    const { intl, toggleDialog, isOpen } = this.props;

    return (
      <Dialog
        icon="upload"
        className="DocumentUploadDialog"
        isOpen={isOpen}
        title={intl.formatMessage(messages.title)}
        onClose={toggleDialog}
      >
        <div className={Classes.DIALOG_BODY}>
          {this.renderContent()}
        </div>
      </Dialog>
    );
  }
}
const mapDispatchToProps = { ingestDocument: ingestDocumentAction };

export default compose(
  connect(null, mapDispatchToProps),
  injectIntl,
)(DocumentUploadDialog);
