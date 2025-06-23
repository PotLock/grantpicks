"use client";

import { useCallback, useState } from "react";
import * as pinata from "@/services/pinata";
import toast from "react-hot-toast";

type UseFileUploadParams = {
  onSuccess?: (data: pinata.FileUploadResult) => void;
};

export const useFileUpload = ({ onSuccess }: UseFileUploadParams | undefined = {}) => {
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<pinata.FileUploadResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    (file?: File | null) => {
      if (file != null) {
        setIsPending(true);

        pinata
          .uploadFile(file)
          .then((result) => {
            onSuccess?.(result);
            setData(result);
          })
          .catch((err) => {
            setError(err);

            toast.error(err.message);
          })
          .finally(() => setIsPending(false));
      } else setError(new Error("No file selected"));
    },

    [onSuccess],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      upload(e.target?.files?.[0]);
    },

    [upload],
  );

  return {
    handleFileInputChange,
    isPending,
    data: data ?? undefined,
    error: error ?? undefined,
  };
};