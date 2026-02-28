"use client";

import { useActionState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@/app/[lang]/components/base/Button";
import Input from "@/app/[lang]/components/base/Input";
import { register } from "@/app/(auth)/register/actions";
import { useAppRouter } from "../../hooks/useAppRouter";
import { useToast } from "@/app/context/toastProvider";
import styles from "./registerForm.module.scss";

const INITIAL_REGISTER_STATE = {
  errors: {},
};

export default function RegisterForm({ dictionary }) {
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
          text={dictionary?.fields?.nameLabel}
          placeholder={dictionary?.placeholders?.name}
          autoComplete="name"
          error={!!nameError}
          errorText={nameError}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="email"
          name="email"
          text={dictionary?.fields?.emailLabel}
          placeholder={dictionary?.placeholders?.email}
          autoComplete="email"
          error={!!emailError}
          errorText={emailError}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="password"
          name="password"
          text={dictionary?.fields?.passwordLabel}
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
          text={dictionary?.fields?.confirmPasswordLabel}
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
        text={isPending ? dictionary?.submitting : dictionary?.submit}
        className={styles.submitButton}
      />
    </form>
  );
}

RegisterForm.propTypes = {
  dictionary: PropTypes.object,
};

RegisterForm.defaultProps = {
  dictionary: {},
};
