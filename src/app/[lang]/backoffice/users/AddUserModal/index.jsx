"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import Modal from "@/app/[lang]/components/base/Modal";
import Tabs from "@/app/[lang]/components/base/Tabs";
import CreateUserTab from "./CreateUserTab";
import InviteTab from "./InviteTab";

const TAB_CREATE = "create";
const TAB_INVITE = "invite";

export default function AddUserModal({ isOpen, onClose, roles, locale }) {
  const t = useTranslations("users.modal");
  const [activeTab, setActiveTab] = useState(TAB_CREATE);

  const tabs = [
    { id: TAB_CREATE, label: t("tabs.create") },
    { id: TAB_INVITE, label: t("tabs.invite") },
  ];

  const handleClose = () => {
    setActiveTab(TAB_CREATE);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("title")} size="md">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === TAB_CREATE ? (
        <CreateUserTab roles={roles} locale={locale} onSuccess={handleClose} />
      ) : (
        <InviteTab roles={roles} locale={locale} onSuccess={handleClose} />
      )}
    </Modal>
  );
}

AddUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
  locale: PropTypes.string.isRequired,
};
