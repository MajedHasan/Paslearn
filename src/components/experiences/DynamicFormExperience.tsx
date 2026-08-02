"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import api from "@/lib/api";
import SystemExperience from "@/components/system/SystemExperience";
import FormRenderer from "@/components/forms/runtime/FormRenderer";
import { IForm } from "@/types/forms/shared/form.interface";


export default function DynamicFormExperience({
  config = {},
}: {
  config?: {
    resourceKey?: string;
    embedded?: boolean;
  };
}) {
  const [state, setState] = useState<
    "loading" | "ready" | "offline" | "backend" | "blocked"
  >("loading");
  const [resource, setResource] = useState<IForm | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!config.resourceKey) {
        setState("blocked");
        return;
      }

      try {
        setState("loading");

        const res = await api.get(`/forms/public/${config.resourceKey}`, {
          timeout: 8000,
        });

        const data = res?.data?.data;

        if (!data) {
          throw new Error("Invalid form payload");
        }

        setResource(data);
        setState("ready");
      } catch (error) {
        console.error(error);

        if (!navigator.onLine) {
          setState("offline");
          return;
        }

        if (axios.isAxiosError(error)) {
          if (!error.response) {
            setState("offline");
            return;
          }

          if (error.response.status >= 500) {
            setState("backend");
            return;
          }
        }

        setState("blocked");
      }
    };

    load();
  }, [config.resourceKey]);

  if (state === "loading") {
    return <SystemExperience variant="loading" />;
  }

  if (state === "offline") {
    return <SystemExperience variant="offline" />;
  }

  if (state === "backend") {
    return <SystemExperience variant="backend" />;
  }

  if (state === "blocked" || !resource) {
    return <SystemExperience variant="blocked" />;
  }

  return <FormRenderer form={resource} embedded={config.embedded} />;
}
