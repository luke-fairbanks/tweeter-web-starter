import { MemoryRouter } from 'react-router-dom';
import Login from '../../../../src/components/authentication/login/Login';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import "@testing-library/jest-dom"
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { LoginPresenter } from '../../../../src/presenter/LoginPresenter';
import { instance, mock, verify } from '@typestrong/ts-mockito'

library.add(fab);

describe('Login component', () => {
  it('starts with the sign in button disabled', () => {
    const { signInButton } = renderLoginAndGetElements("/some-url");

    expect(signInButton).toBeDisabled();
  });

  it('enables the sign in button if both alias and password fields have text', async () => {
    const { user, signInButton, aliasInput, passwordInput } = renderLoginAndGetElements("/some-url");

    await user.type(aliasInput, "test");
    await user.type(passwordInput, "password");

    expect(signInButton).toBeEnabled();
  });

  it('disables the sign in button if either the alias or password field is cleared', async () => {
    const { user, signInButton, aliasInput, passwordInput } = renderLoginAndGetElements("/some-url");

    await user.type(aliasInput, "test");
    await user.type(passwordInput, "password");

    expect(signInButton).toBeEnabled();

    await user.clear(aliasInput);

    expect(signInButton).toBeDisabled();

    await user.type(aliasInput, "test");

    expect(signInButton).toBeEnabled();

    await user.clear(passwordInput);

    expect(signInButton).toBeDisabled();
  });

  it('calls the presenters login method with correct parameters when the sign in button is pressed', async () => {
    const mockPresenter  = mock<LoginPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const originalUrl = "/some-url";
    const alias = "test";
    const password = "password";
    const rememberMe = false;

    const { user, signInButton, aliasInput, passwordInput } = renderLoginAndGetElements(originalUrl, mockPresenterInstance);

    await user.type(aliasInput, alias);
    await user.type(passwordInput, password);
    await user.click(signInButton);

    verify(mockPresenter.doLogin(alias, password, rememberMe, originalUrl)).once();
  })
});

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
    return render(
        <MemoryRouter>
            {!!presenter ? <Login presenter={presenter} originalUrl={originalUrl} /> : <Login originalUrl={originalUrl} />}
        </MemoryRouter>
    );
}

function renderLoginAndGetElements(originalUrl: string, presenter?: LoginPresenter) {
    const user = userEvent.setup();

    renderLogin(originalUrl, presenter);

    const signInButton = screen.getByRole("button", { name: /Sign in/i})
    const aliasInput = screen.getByLabelText(/alias/i);
    const passwordInput = screen.getByLabelText(/password/i);

    return { user, signInButton, aliasInput, passwordInput };
}