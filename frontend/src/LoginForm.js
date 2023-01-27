import React, { useCallback, useState } from "react";

function LoginForm(props) {
  const { onLogin } = props;

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      
      try {
        const result = await fetch(process.env.REACT_APP_BACKEND_URL + "/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await result.json();

        if (data.user) {
          onLogin?.(data.user);
        } else {
          alert(data.error || "An error occured while logging in. Check the server logs for details");
        }
      } catch (error) {
        alert(error.toString());
      }
    },
    [values, onLogin]
  );

  const handleInputChange = useCallback((e) => {
    setValues((values) => ({
      ...values,
      [e.target.name]: e.target.value,
    }));
  }, []);

  return (
    <form onSubmit={handleLogin} className="form">
      <input
        name="email"
        type="text"
        placeholder="Email"
        className="input"
        value={values.email}
        onChange={handleInputChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="input"
        value={values.password}
        onChange={handleInputChange}
      />
      <button type="submit" className="button">
        Login
      </button>
    </form>
  );
}
export default LoginForm;
