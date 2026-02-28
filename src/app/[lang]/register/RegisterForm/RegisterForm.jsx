"use client";

import { useActionState, useEffect } from "react";
import Button from "@/app/[lang]/components/base/Button";
import Input from "@/app/[lang]/components/base/Input";
import { register } from "@/app/(auth)/register/actions";
import { useAppRouter } from "../../hooks/useAppRouter";
import { useToast } from "@/app/context/toastProvider";
import styles from "./registerForm.module.scss";

const INITIAL_REGISTER_STATE = {
  errors: {},
};

export default function RegisterForm() {
  const appRouter = useAppRouter();
  const { showError } = useToast();
  const [state, formAction, isPending] = useActionState(register, INITIAL_REGISTER_STATE);

  useEffect(() => {
    if (state?.errors?.general?.[0]) {
      showError(state.errors.general[0]);
    }
  }, [showError, state?.errors?.general]);

  const nameError = state?.errors?.name?.[0] || "";
  const emailError = state?.errors?.email?.[0] || "";
  const passwordErrors = state?.errors?.password || [];
  const confirmPasswordError = state?.errors?.confirmPassword?.[0] || "";

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="locale" value={appRouter.locale} />

      <div className={styles.inputContainer}>
        <Input
          id="name"
          name="name"
          text="Name"
          placeholder="John Doe"
          autoComplete="name"
          error={!!nameError}
          errorText={nameError}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="email"
          name="email"
          text="Email"
          placeholder="john@example.com"
          autoComplete="email"
          error={!!emailError}
          errorText={emailError}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="password"
          name="password"
          text="Password"
          type="password"
          autoComplete="new-password"
          showPassword={true}
          error={passwordErrors.length > 0}
          errorText={passwordErrors.join(" ")}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          text="Confirm Password"
          type="password"
          autoComplete="new-password"
          showPassword={true}
          error={!!confirmPasswordError}
          errorText={confirmPasswordError}
        />
      </div>

      <Button
        disabled={isPending}
        type="submit"
        text={isPending ? "Signing Up..." : "Sign Up"}
        className={styles.submitButton}
      />
    </form>
  );
}
