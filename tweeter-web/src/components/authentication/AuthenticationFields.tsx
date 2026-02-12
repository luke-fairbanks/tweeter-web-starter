interface Props {
  onEnter: (event: React.KeyboardEvent<HTMLElement>) => void;
  setAlias: (alias: string) => void;
  setPassword: (password: string) => void;
  passwordContainerClass?: string;
  passwordInputClass?: string;
}

const AuthenticationFields = (props: Props) => {
  return (
    <>
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          size={50}
          id="aliasInput"
          placeholder="name@example.com"
          onKeyDown={props.onEnter}
          onChange={(event) => props.setAlias(event.target.value)}
        />
        <label htmlFor="aliasInput">Alias</label>
      </div>
      <div className={props.passwordContainerClass ?? "form-floating"}>
        <input
          type="password"
          className={props.passwordInputClass ?? "form-control"}
          id="passwordInput"
          placeholder="Password"
          onKeyDown={props.onEnter}
          onChange={(event) => props.setPassword(event.target.value)}
        />
        <label htmlFor="passwordInput">Password</label>
      </div>
    </>
  );
};

export default AuthenticationFields;
