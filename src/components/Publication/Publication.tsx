import React from 'react';
import useTrack from '../../hooks/useTrack/useTrack';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import TourView from '../Tour/TourView';

import { IVideoTrack } from '../../types';
import {
  AudioTrack as IAudioTrack,
  LocalTrackPublication,
  Participant,
  RemoteTrackPublication,
  Track,
} from 'twilio-video';

interface PublicationProps {
  isTourEnabled: boolean;
  publication: LocalTrackPublication | RemoteTrackPublication;
  participant: Participant;
  isLocalParticipant?: boolean;
  videoOnly?: boolean;
  videoPriority?: Track.Priority | null;
}

export default function Publication({
  isTourEnabled,
  publication,
  isLocalParticipant,
  videoOnly,
  videoPriority,
}: PublicationProps) {
  const track = useTrack(publication);
  const tourStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 2,
  };

  if (!track) return null;

  switch (track.kind) {
    case 'video':
      return (
        <>
          {isTourEnabled == true ? (
            <TourView styleItems={tourStyle} />
          ) : (
            <VideoTrack
              track={track as IVideoTrack}
              priority={videoPriority}
              isLocal={track.name.includes('camera') && isLocalParticipant}
            />
          )}
        </>
      );
    case 'audio':
      return videoOnly ? null : <AudioTrack track={track as IAudioTrack} />;
    default:
      return null;
  }
}
