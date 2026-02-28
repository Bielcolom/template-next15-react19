"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "./loginForm.module.scss";
import Button from "@/app/[lang]/components/base/Button";
import Input from "@/app/[lang]/components/base/Input";
import { login } from "@/app/(auth)/login/actions";
import { useAppRouter } from "../../hooks/useAppRouter";
import { useToast } from "@/app/context/toastProvider";

const INITIAL_LOGIN_STATE = {
  errors: {},
};

export function LoginForm() {
  const t = useTranslations("login");
  const appRouter = useAppRouter();
  const { showError } = useToast();
  const [state, formAction, isPending] = useActionState(login, INITIAL_LOGIN_STATE);

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
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          error={!!emailError}
          errorText={emailError?.[0] || ""}
          infoText={t("emailInfo")}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          error={!!passwordError}
          errorText={passwordError?.[0] || ""}
          showPassword={true}
        />
      </div>

      <Button
        disabled={isPending}
        type="submit"
        text={isPending ? t("submitting") : t("submit")}
        className={styles.submitButton}
      />
    </form>
  );
}
