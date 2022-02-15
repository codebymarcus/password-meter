import React from "react";
import debounce from "lodash.debounce";
import "./styles.css";

const STRENGTH_LABEL = {
  1: "too weak",
  2: "weak",
  3: "okay",
  4: "strong",
  5: "very strong"
};

const PASSWORD_STRENGTH_API =
  "https://o9etf82346.execute-api.us-east-1.amazonaws.com/staging/password/strength";

const Filled = ({ strength }) => {
  const STRENGTH_CLASS = {
    1: "very-weak",
    2: "weak",
    3: "medium",
    4: "strong",
    5: "very-strong"
  };
  return [...Array(strength)].map((i, key) => (
    <div key={key} className={`filled ${STRENGTH_CLASS[strength]}`}></div>
  ));
};

export default function App() {
  const [passwordStrengthNum, setPasswordStrengthNum] = React.useState(0);
  const [isFetching, setIsFetching] = React.useState(false);
  const [strengthMeterResult, setStrengthMeterResult] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const [isPasswordHidden, setIsPasswordHidden] = React.useState(true);

  const checkPasswordStrength = async (val) => {
    try {
      const result = await fetch(PASSWORD_STRENGTH_API, {
        method: "POST",
        body: JSON.stringify({ password: val })
      });

      const data = await result.json();
      console.log(data);
      setPasswordStrengthNum(data.score || 0);
      setStrengthMeterResult(data.error ? null : data);
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      throw new Error(error);
    }
  };

  const _onSetPassword = debounce((val) => {
    setPassword(val);
    setIsFetching(true);
    checkPasswordStrength(val);
  }, 500);

  const _onPasswordChange = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    _onSetPassword(e.currentTarget.value);
  };

  console.log("passwordstrength", passwordStrengthNum);

  return (
    <div className="App grid">
      <div className="password-checker--container">
        <h2>Is your password strong enough?</h2>
        <div className="password-container grid">
          <div className="password-box flex flex-row">
            <input
              onChange={_onPasswordChange}
              type={isPasswordHidden ? "password" : "text"}
              placeholder="type a password"
              className="text-center"
              name=""
              id=""
            />
            <button
              className="btn-hide"
              onClick={() => setIsPasswordHidden((state) => !state)}
            >
              {isPasswordHidden ? "UNHIDE" : "HIDE"}
            </button>
          </div>
          <div className="strength-indicator grid">
            <Filled
              strength={password && !isFetching ? passwordStrengthNum + 1 : 0}
            />
            {[
              ...Array(
                password && !isFetching ? 5 - passwordStrengthNum - 1 : 5
              )
            ].map((i, key) => (
              <div className="not-filled" key={key}></div>
            ))}
          </div>
          {strengthMeterResult && (
            <>
              <p className="text-lg bold space-top">
                Your password is {STRENGTH_LABEL[strengthMeterResult.score + 1]}
                .
              </p>
              <p>
                It will take {strengthMeterResult.guessTimeString} to guess your
                password. {strengthMeterResult.warning}
              </p>
              {strengthMeterResult.suggestions &&
                strengthMeterResult.suggestions.length > 0 &&
                strengthMeterResult.suggestions.map((text, i) => (
                  <p key={i} className="bold">
                    {text}
                  </p>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
