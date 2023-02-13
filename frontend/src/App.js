import "./App.css";
import "@roq/ui-react/dist/index.css";

import { useCallback, useState, useMemo } from "react";
import { RoqProvider, ChatProvider, Chat, NotificationBell } from "@roq/ui-react";

import AuthorizationForm from "./AuthorizationForm";
import Files from "./Files";

import logo from "./logo.svg";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");

  const handleAuthorize = useCallback((user) => {
    setUser(user);
  }, []);

  const handleLogout = useCallback(() => setUser(null), []);

  const handleNavigateToHome = useCallback(() => setPage("home"), []);

  const handleNavigateToChat = useCallback(() => setPage("chat"), []);

  const roqConfig = useMemo(
    () => ({
      host: process.env.REACT_APP_PLATFORM_URL,
      token: user?.roqAccessToken,
      socket: true,
      auth: {
        loginURL: "/beta/login",
      },
    }),
    [user?.roqAccessToken]
  );

  return (
    <div className="App">
      <RoqProvider config={roqConfig}>
        {!!user ? (
          <ChatProvider>
            <header className="header">
              <div className="header-links">
                <a className="logo" href="#" onClick={handleNavigateToHome}>
                  <img src={logo} alt="logo" />
                </a>
                <a className="navigation-link" href="#" onClick={handleNavigateToChat}>
                  Chat
                </a>
              </div>
              <div className="header-buttons">
                <NotificationBell />

                <button className="button" onClick={handleLogout}>
                  logout
                </button>
              </div>
            </header>
            <section className="content">{page === "home" ? <Files userId={user.id} /> : <Chat fluid />}</section>
          </ChatProvider>
        ) : (
          <div className="unauthorized">
            <AuthorizationForm onAuthorize={handleAuthorize} />
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&amp;utm_medium=default-template&amp;utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="docs"
            >
              <h2>Docs</h2>
              <div>https://docs.roq.tech</div>
            </a>
          </div>
        )}
      </RoqProvider>
    </div>
  );
}

export default App;
