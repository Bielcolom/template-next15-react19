"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import { useToast } from "@/app/context/toastProvider";
import Input from "@/app/[lang]/components/base/Input";
import Selector from "@/app/[lang]/components/base/Selector";
import Button from "@/app/[lang]/components/base/Button";
import { sendUserInvitations } from "@/app/backoffice/users/actions";
import styles from "./addUserModal.module.scss";

export default function InviteTab({ roles, locale, onSuccess }) {
  const t = useTranslations("users.modal.invite");
  const tc = useTranslations("common");
  const { showSuccess, showError } = useToast();

  const [emails, setEmails] = useState([""]);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateEmail = (index, value) =>
    setEmails((prev) => prev.map((e, i) => (i === index ? value : e)));

  const addEmail = () => setEmails((prev) => [...prev, ""]);

  const removeEmail = (index) =>
    setEmails((prev) => prev.filter((_, i) => i !== index));

  const validEmails = emails.filter((e) => e.trim() !== "");

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");

    if (validEmails.length === 0) {
      setError(t("errorNoEmails"));
      return;
    }
    if (!roleName) {
      setError(t("errorNoRole"));
      return;
    }

    setLoading(true);
    try {
      const result = await sendUserInvitations(locale, { emails: validEmails, roleName });

      if (result?.errors?.length > 0) {
        setError(result.errors[0]);
      } else {
        const { sent = [], failed = [] } = result?.data ?? {};
        if (failed.length > 0) {
          showError(t("partialError", { count: failed.length }));
        } else {
          showSuccess(t("successMessage", { count: sent.length }));
        }
        setEmails([""]);
        setRoleName("");
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

      <Selector
        text={t("role")}
        placeholder={t("rolePlaceholder")}
        options={roles}
        value={roleName}
        onChange={setRoleName}
        disabled={loading}
      />

      <div className={styles.emailList}>
        {emails.map((email, index) => (
          <div key={index} className={styles.emailRow}>
            <div className={styles.emailRowInput}>
              <Input
                text={index === 0 ? t("emails") : ""}
                placeholder="user@example.com"
                type="email"
                value={email}
                onChange={(val) => updateEmail(index, val)}
                disabled={loading}
              />
            </div>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeEmail(index)}
              disabled={emails.length === 1 || loading}
              aria-label={t("removeEmail")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addEmailBtn}
        onClick={addEmail}
        disabled={loading}
      >
        + {t("addEmail")}
      </button>

      {validEmails.length > 0 && (
        <p className={styles.summaryBox}>
          {t("summary", { count: validEmails.length })}
          {roleName && (
            <> — <strong>{t("summaryRole", { role: roleName })}</strong></>
          )}
        </p>
      )}

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
          text={loading ? tc("send") + "…" : tc("send")}
          disabled={loading || validEmails.length === 0}
          type="submit"
        />
      </div>
    </form>
  );
}

InviteTab.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  locale: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
