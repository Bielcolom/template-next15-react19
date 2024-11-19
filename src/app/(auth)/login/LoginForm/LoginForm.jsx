"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { redirect, useRouter } from "next/navigation";
import { login } from "../actions";
import styles from "./loginForm.module.scss";
import Button from "@/app/components/base/Button";
import { useUserContext } from "context/UserContext";

export function LoginForm() {
  const router = useRouter();
  const [state, loginAction] = useActionState(login);
  const { setUserId } = useUserContext();

  useEffect(() => {
    if (state?.success) {
      if (state.userId) {
        console.log(state);
        localStorage.setItem("userId", state.userId);
        setUserId(state.userId);
      }
      redirect("/");
    }
  }, [state?.success, state?.userId, setUserId, router]);

  return (
    <form action={loginAction} className={styles.form}>
      <div className={styles.inputContainer}>
        <input id="email" name="email" />
      </div>
      {state?.errors?.email && (
        <p className={styles.error}>{state.errors.email}</p>
      )}

      <div className={styles.inputContainer}>
        <input id="password" name="password" type="password" />
      </div>
      {state?.errors?.password && (
        <p className={styles.error}>{state.errors.password}</p>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      text={pending ? "Logging in..." : "Login"}
    />
  );
}
