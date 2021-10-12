import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { AboutPage } from "view/AboutPage";
import { UserDataContextProvider } from "context/UserDataContext";
import { SocketContextProvider } from "context/SocketContext";
import { Header } from "view/Header";
import { RoomView } from "view/RoomView";
import { HomePage } from "view/HomePage";

export const App = observer(() => {
  return (
    <div className="App">
      <UserDataContextProvider>
        <SocketContextProvider>
          <Router>
            <div className="site-container">
              <Header />
              <Switch>
                <Route path="/room/:roomId">
                  <RoomView />
                </Route>
                <Route path="/about">
                  <AboutPage />
                </Route>
                {/* <Route path="/test">
                  <BoardViewTest />
                </Route> */}
                <Route path="/">
                  <HomePage />
                </Route>
              </Switch>
            </div>
          </Router>
        </SocketContextProvider>
      </UserDataContextProvider>
    </div>
  );
});
