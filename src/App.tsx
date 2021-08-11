import React, { useState } from 'react';
import { styled, Theme } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MenuBar from './components/MenuBar/MenuBar';
import MobileTopMenuBar from './components/MobileTopMenuBar/MobileTopMenuBar';
import PreJoinScreens from './components/PreJoinScreens/PreJoinScreens';
import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import RecordingNotifications from './components/RecordingNotifications/RecordingNotifications';
import Room from './components/Room/Room';

import useHeight from './hooks/useHeight/useHeight';
import useRoomState from './hooks/useRoomState/useRoomState';

import HomeView from './components/Home/Home';
import TourView from './components/Tour/TourView';

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: '1fr auto',
});

const Main = styled('main')(({ theme }: { theme: Theme }) => ({
  overflow: 'hidden',
  paddingBottom: `${theme.footerHeight}px`, // Leave some space for the footer
  background: 'black',
  [theme.breakpoints.down('sm')]: {
    paddingBottom: `${theme.mobileFooterHeight + theme.mobileTopBarHeight}px`, // Leave some space for the mobile header and footer
  },
}));

// const AfterJoinScreen = () => {
//   const roomState = useRoomState();
//   return (
//     <>
//       {roomState != 'disconnected' ? (
//         <Main>
//           <ReconnectingNotification />
//           <RecordingNotifications />
//           <MobileTopMenuBar />
//           <Room isTourEnabled={isTourEnabled} />
//           <MenuBar />
//         </Main>
//       ) : (
//         <div>No Connection</div>
//       )}
//     </>
//   );
// };

export default function App() {
  const roomState = useRoomState();
  const [isTourEnabled, setIsTourEnabled] = useState(false);
  // Here we would like the height of the main container to be the height of the viewport.
  // On some mobile browsers, 'height: 100vh' sets the height equal to that of the screen,
  // not the viewport. This looks bad when the mobile browsers location bar is open.
  // We will dynamically set the height with 'window.innerHeight', which means that this
  // will look good on mobile browsers even after the location bar opens or closes.
  const height = useHeight();

  const toggleTourState = (val: boolean) => {
    setIsTourEnabled(val);
  };

  return (
    <Container style={{ height }}>
      {roomState === 'disconnected' ? (
        <PreJoinScreens />
      ) : (
        <Main>
          <ReconnectingNotification />
          <RecordingNotifications />
          <MobileTopMenuBar toggleTourState={toggleTourState} />
          <Room isTourEnabled={isTourEnabled} />
          <MenuBar isTourEnabled={isTourEnabled} toggleTourState={toggleTourState} />
        </Main>
      )}
    </Container>
  );
}

/* <Router>
        <Switch>
          <Route exact path="/" component={PreJoinScreens} />
          <Route path="/room/:roomNameParam">
            (
            <Main>
              <ReconnectingNotification />
              <RecordingNotifications />
              <MobileTopMenuBar />
              <Room />
              <MenuBar />
            </Main>
            )
          </Route>
          <Route path="/3dtour" component={TourView} />
        </Switch>
      </Router> */
