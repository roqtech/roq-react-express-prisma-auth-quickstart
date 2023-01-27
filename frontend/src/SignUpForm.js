import React, { useCallback, useState } from "react";

function SignUpForm(props) {
  const { onRegister } = props;

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const result = await fetch(process.env.REACT_APP_BACKEND_URL + "/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await result.json();

        if (data.user) {
          onRegister?.(data.user);
        } else {
          alert(data.error || "An error occured while registering. Check the server logs for details");
        }
      } catch (error) {
        alert(error.toString());
      }
    },
    [values, onRegister]
  );

  const handleInputChange = useCallback((e) => {
    setValues((values) => ({
      ...values,
      [e.target.name]: e.target.value,
    }));
  }, []);

  return (
    <form onSubmit={handleSignUp} className="form">
      <input
        name="name"
        type="text"
        placeholder="Name"
        className="input"
        value={values.emai}
        onChange={handleInputChange}
      />
      <input
        name="email"
        type="text"
        placeholder="Email"
        className="input"
        value={values.emai}
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
        Sign Up
      </button>
    </form>
  );
}
export default SignUpForm;
