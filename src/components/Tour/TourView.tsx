import React, { PropsWithChildren, useState } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';

import { version as appVersion } from '../../../package.json';
import Video from 'twilio-video';
import { useAppState } from '../../state';

import { iframeStack, IframeElement } from './TourProvider';

interface TourViewProps {
  styleItems: any;
}

function TourView(props: TourViewProps) {
  const { roomType } = useAppState();
  return (
    <div style={props.styleItems}>
      <IframeElement iframe={iframeStack[0]} />
    </div>
  );
}

export default TourView;
