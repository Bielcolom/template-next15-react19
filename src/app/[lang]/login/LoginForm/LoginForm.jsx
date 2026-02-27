"use client";

import { useState, useEffect } from "react";
import styles from "./loginForm.module.scss";
import Button from "@/app/[lang]/components/base/Button";
import Input from "@/app/[lang]/components/base/Input";
import { login } from "@/app/(auth)/login/actions";
import { INDEX_URL } from "@/utils/urls";
import { ERROR_CODES } from "@/errors/codes";
import { createGeneralErrorResponse } from "@/errors/responses";
import { useAppRouter } from "../../hooks/useAppRouter";

export function LoginForm() {
  const appRouter = useAppRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      appRouter.replace(INDEX_URL);
    }
  }, [appRouter, success]);

  const handleChange = (value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({ ...formData, locale: appRouter.locale });
      if (response?.success) {
        setSuccess(true);
      } else {
        setError(response?.errors || createGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR).errors);
      }
    } catch {
      setError(createGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR).errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.inputContainer}>
        <Input
          id="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(value) => handleChange(value, "email")}
          error={!!error?.email}
          errorText={error?.email}
          infoText="We'll never share your email."
        />
      </div>

      <div className={styles.inputContainer}>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(value) => handleChange(value, "password")}
          error={!!error?.password}
          errorText={error?.password}
          showPassword={true}
        />
      </div>

      <Button
        disabled={loading}
        type="submit"
        text={loading ? "Logging in..." : "Login"}
        className={styles.submitButton}
      />
    </form>
  );
}
