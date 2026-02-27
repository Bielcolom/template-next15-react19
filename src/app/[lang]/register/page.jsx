"use client";
import { useActionState } from "react";
import { register } from "../../(auth)/register/actions";
import { useAppRouter } from "../hooks/useAppRouter";

const INITIAL_REGISTER_STATE = {
  errors: {},
};

export default function Register() {
  const appRouter = useAppRouter();
  const [state, action, isPending] = useActionState(register, INITIAL_REGISTER_STATE);

  return (
    <form action={action}>
      <input type="hidden" name="locale" value={appRouter.locale} />
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="John Doe" />
      </div>
      {state?.errors?.name?.[0] && <p>{state.errors.name[0]}</p>}

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" placeholder="john@example.com" />
      </div>
      {state?.errors?.email?.[0] && <p>{state.errors.email[0]}</p>}

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      {state?.errors?.password && (
        <div>
          <p>Password must:</p>
          <ul>
            {state.errors.password.map((error, index) => (
              <li key={index}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" />
      </div>
      {state?.errors?.confirmPassword?.[0] && (
        <p>{state.errors.confirmPassword[0]}</p>
      )}

      <button disabled={isPending} type="submit">
        {isPending ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
}
