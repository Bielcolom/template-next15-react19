"use client";

import { useActionState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./loginForm.module.scss";
import Button from "@/app/[lang]/components/base/Button";
import Input from "@/app/[lang]/components/base/Input";
import { login } from "@/app/(auth)/login/actions";
import { INDEX_URL } from "@/utils/urls";
import { useAppRouter } from "../../hooks/useAppRouter";
import { useToast } from "@/app/context/toastProvider";

const INITIAL_LOGIN_STATE = {
  errors: {},
};

export function LoginForm({ successMessage }) {
  const appRouter = useAppRouter();
  const { showError, showSuccess } = useToast();
  const [state, formAction, isPending] = useActionState(login, INITIAL_LOGIN_STATE);

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    if (successMessage) {
      showSuccess(successMessage);
    }

    appRouter.replace(INDEX_URL);
  }, [appRouter, showSuccess, state?.success, successMessage]);

  useEffect(() => {
    if (state?.errors?.general?.[0]) {
      showError(state.errors.general[0]);
    }
  }, [showError, state?.errors?.general]);

  const emailError = state?.errors?.email;
  const passwordError = state?.errors?.password;

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="locale" value={appRouter.locale} />

      <div className={styles.inputContainer}>
        <Input
          id="email"
          name="email"
          placeholder="Enter your email"
          autoComplete="email"
          error={!!emailError}
          errorText={emailError?.[0] || ""}
          infoText="We'll never share your email."
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={!!passwordError}
          errorText={passwordError?.[0] || ""}
          showPassword={true}
        />
      </div>

      <Button
        disabled={isPending}
        type="submit"
        text={isPending ? "Logging in..." : "Login"}
        className={styles.submitButton}
      />
    </form>
  );
}

LoginForm.propTypes = {
  successMessage: PropTypes.string,
};

LoginForm.defaultProps = {
  successMessage: "",
};
