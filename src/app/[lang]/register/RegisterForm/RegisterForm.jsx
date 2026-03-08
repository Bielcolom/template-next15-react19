"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Button from "@/app/[lang]/components/base/Button";
import Input from "@/app/[lang]/components/base/Input";
import { createUser } from "@/app/(auth)/register/actions";
import { useAppRouter } from "../../hooks/useAppRouter";
import { useToast } from "@/app/context/toastProvider";
import styles from "./registerForm.module.scss";

const INITIAL_REGISTER_STATE = {
  errors: {},
};

export default function RegisterForm() {
  const t = useTranslations("register");
  const appRouter = useAppRouter();
  const { showError } = useToast();
  const [state, formAction, isPending] = useActionState(createUser, INITIAL_REGISTER_STATE);

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
          text={t("fields.nameLabel")}
          placeholder={t("placeholders.name")}
          autoComplete="name"
          error={!!nameError}
          errorText={nameError}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="email"
          name="email"
          text={t("fields.emailLabel")}
          placeholder={t("placeholders.email")}
          autoComplete="email"
          error={!!emailError}
          errorText={emailError}
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="password"
          name="password"
          text={t("fields.passwordLabel")}
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
          text={t("fields.confirmPasswordLabel")}
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
        text={isPending ? t("submitting") : t("submit")}
        className={styles.submitButton}
      />
    </form>
  );
}
