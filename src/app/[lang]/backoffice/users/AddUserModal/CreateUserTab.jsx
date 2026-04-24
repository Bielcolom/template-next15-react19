"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/toastProvider";
import Input from "@/app/[lang]/components/base/Input";
import Selector from "@/app/[lang]/components/base/Selector";
import Button from "@/app/[lang]/components/base/Button";
import { adminCreateUser } from "@/app/backoffice/users/actions";
import styles from "./addUserModal.module.scss";

const EMPTY_FORM = { name: "", email: "", password: "", roleName: "" };

export default function CreateUserTab({ roles, locale, onSuccess }) {
  const t = useTranslations("users.modal.create");
  const tc = useTranslations("common");
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [requireChangePassword, setRequireChangePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.roleName) {
      setError(t("errorRequired"));
      return;
    }

    setLoading(true);
    try {
      const result = await adminCreateUser(locale, {
        name: form.name,
        email: form.email,
        password: form.password,
        roleName: form.roleName,
        requireChangePassword,
      });

      if (result?.errors?.length > 0) {
        setError(result.errors[0]);
      } else {
        showSuccess(tc("feedback.userCreated"));
        setForm(EMPTY_FORM);
        router.refresh();
        onSuccess();
      }
    } catch {
      showError(tc("errors.unexpected"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <p className={styles.errorBanner}>{error}</p>}

      <div className={styles.row}>
        <Input
          text={t("name")}
          placeholder={t("namePlaceholder")}
          value={form.name}
          onChange={set("name")}
          disabled={loading}
        />
        <Input
          text={t("email")}
          placeholder="user@example.com"
          type="email"
          value={form.email}
          onChange={set("email")}
          disabled={loading}
        />
      </div>

      <div className={styles.row}>
        <Input
          text={t("password")}
          placeholder="••••••••"
          showPassword
          value={form.password}
          onChange={set("password")}
          disabled={loading}
          infoText={t("passwordHint")}
        />
        <Selector
          text={t("role")}
          placeholder={t("rolePlaceholder")}
          options={roles}
          value={form.roleName}
          onChange={set("roleName")}
          disabled={loading}
        />
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={requireChangePassword}
          onChange={(e) => setRequireChangePassword(e.target.checked)}
          disabled={loading}
        />
        <span className={styles.checkboxLabel}>
          <span className={styles.checkboxTitle}>{t("requireChangePassword")}</span>
          <span className={styles.checkboxHint}>{t("requireChangePasswordHint")}</span>
        </span>
      </label>

      <div className={styles.actions}>
        <Button
          styleType="secondary"
          text={tc("cancel")}
          onClick={onSuccess}
          disabled={loading}
          type="button"
        />
        <Button
          styleType="primary"
          text={loading ? tc("create") + "…" : tc("create")}
          disabled={loading}
          type="submit"
        />
      </div>
    </form>
  );
}

CreateUserTab.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  locale: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
