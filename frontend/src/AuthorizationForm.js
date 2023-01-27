import React, { useState } from "react";

import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

function AuthorizationForm(props) {
  const { onAuthorize } = props;
  const [type, setType] = useState("login");

  return (
    <div className="card">
      {type === "login" ? (
        <>
          <LoginForm onLogin={onAuthorize} />
          <button className="button secondary" onClick={() => setType("register")}>
            Register →
          </button>
        </>
      ) : (
        <>
          <SignUpForm onRegister={onAuthorize} />
          <button className="button secondary" onClick={() => setType("login")}>
            Login →
          </button>
        </>
      )}
    </div>
  );
}
export default AuthorizationForm;
